import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsOrder, FindOptionsWhere, LessThanOrEqual, MoreThanOrEqual, Not } from 'typeorm';
import { CreateUtilityDto } from './dto/create-utility.dto';
import { UpdateUtilityDto } from './dto/update-utility.dto';
import { Utilities } from './entities/utility.entity';
import { Room } from '../room/entities/room.entity';

interface PaginationOptions {
  page: number;
  limit: number;
  search?: string;
  roomId?: number;
  startDate?: Date;
  endDate?: Date;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
}

@Injectable()
export class UtilitiesService {
  constructor(
    @InjectRepository(Utilities)
    private utilitiesRepository: Repository<Utilities>,
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
  ) {}

  async create(createUtilityDto: CreateUtilityDto): Promise<Utilities> {
    // Validate room exists
    const room = await this.roomRepository.findOne({
      where: { roomid: createUtilityDto.roomId }
    });

    if (!room) {
      throw new NotFoundException(`Không tìm thấy phòng với ID ${createUtilityDto.roomId}`);
    }

    // Validate meter readings
    if (createUtilityDto.currentElectricityMeter < createUtilityDto.previousElectricityMeter) {
      throw new BadRequestException(`Chỉ số điện mới không thể nhỏ hơn chỉ số điện cũ`);
    }

    if (createUtilityDto.currentWaterMeter < createUtilityDto.previousWaterMeter) {
      throw new BadRequestException(`Chỉ số nước mới không thể nhỏ hơn chỉ số nước cũ`);
    }

    // Validate dates
    const startDate = new Date(createUtilityDto.startDate);
    const endDate = new Date(createUtilityDto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('Ngày bắt đầu phải trước ngày kết thúc');
    }

    // Create new utility record
    const newUtility = this.utilitiesRepository.create({
      startdate: createUtilityDto.startDate,
      enddate: createUtilityDto.endDate,
      previouselectricitymeter: createUtilityDto.previousElectricityMeter,
      currentelectricitymeter: createUtilityDto.currentElectricityMeter,
      previouswatermeter: createUtilityDto.previousWaterMeter,
      currentwatermeter: createUtilityDto.currentWaterMeter,
      room: room
    });

    return this.utilitiesRepository.save(newUtility);
  }

  async findAll(): Promise<Utilities[]> {
    return this.utilitiesRepository.find({
      relations: ['room', 'room.building'],
      order: { utilitiesid: 'DESC' }
    });
  }

  async findAllWithPagination(options: PaginationOptions): Promise<{ data: Utilities[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, search, roomId, startDate, endDate, sortBy = 'utilitiesid', sortOrder = 'DESC' } = options;
    
    const skip = (page - 1) * limit;
    
    let queryBuilder = this.utilitiesRepository.createQueryBuilder('utilities')
      .leftJoinAndSelect('utilities.room', 'room')
      .leftJoinAndSelect('room.building', 'building');
      
    if (roomId) {
      queryBuilder = queryBuilder.andWhere('room.roomid = :roomId', { roomId });
    }
    
    if (startDate && endDate) {
      queryBuilder = queryBuilder.andWhere(
        '(utilities.startdate <= :endDate AND utilities.enddate >= :startDate)',
        { 
          startDate: startDate.toISOString().split('T')[0], 
          endDate: endDate.toISOString().split('T')[0] 
        }
      );
    }
    
    if (search) {
      queryBuilder = queryBuilder.andWhere(
        '(CAST(utilities.utilitiesid AS TEXT) LIKE :search OR room.roomnumber LIKE :search OR building.buildingname LIKE :search)',
        { search: `%${search}%` }
      );
    }
    
    queryBuilder = queryBuilder
      .orderBy(`utilities.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit);
      
    const [result, total] = await queryBuilder.getManyAndCount();
    
    return {
      data: result,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<Utilities> {
    const utility = await this.utilitiesRepository.findOne({
      where: { utilitiesid: id },
      relations: ['room', 'room.building', 'invoices']
    });
    
    if (!utility) {
      throw new NotFoundException(`Không tìm thấy tiện ích với ID ${id}`);
    }
    
    return utility;
  }

  async findByRoom(roomId: number): Promise<Utilities[]> {
    const room = await this.roomRepository.findOne({
      where: { roomid: roomId }
    });

    if (!room) {
      throw new NotFoundException(`Không tìm thấy phòng với ID ${roomId}`);
    }

    return this.utilitiesRepository.find({
      where: { room: { roomid: roomId } },
      relations: ['room', 'invoices'],
      order: { startdate: 'DESC' }
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Utilities[]> {
    return this.utilitiesRepository.find({
      where: [
        {
          startdate: Between(
            startDate.toISOString().split('T')[0], 
            endDate.toISOString().split('T')[0]
          )
        },
        {
          enddate: Between(
            startDate.toISOString().split('T')[0], 
            endDate.toISOString().split('T')[0]
          )
        }
      ],
      relations: ['room', 'room.building'],
      order: { startdate: 'DESC' }
    });
  }

  async update(id: number, updateUtilityDto: UpdateUtilityDto): Promise<Utilities> {
    const utility = await this.findOne(id);
    
    // Update room if provided
    if (updateUtilityDto.roomId) {
      const room = await this.roomRepository.findOne({
        where: { roomid: updateUtilityDto.roomId }
      });
      
      if (!room) {
        throw new NotFoundException(`Không tìm thấy phòng với ID ${updateUtilityDto.roomId}`);
      }
      
      utility.room = room;
    }
    
    // Update dates if provided
    if (updateUtilityDto.startDate) {
      utility.startdate = updateUtilityDto.startDate;
    }
    
    if (updateUtilityDto.endDate) {
      utility.enddate = updateUtilityDto.endDate;
    }
    
    // Validate dates
    const startDate = new Date(utility.startdate);
    const endDate = new Date(utility.enddate);
    
    if (startDate >= endDate) {
      throw new BadRequestException('Ngày bắt đầu phải trước ngày kết thúc');
    }
    
    // Update meter readings if provided
    if (updateUtilityDto.previousElectricityMeter !== undefined) {
      utility.previouselectricitymeter = updateUtilityDto.previousElectricityMeter;
    }
    
    if (updateUtilityDto.currentElectricityMeter !== undefined) {
      utility.currentelectricitymeter = updateUtilityDto.currentElectricityMeter;
    }
    
    if (updateUtilityDto.previousWaterMeter !== undefined) {
      utility.previouswatermeter = updateUtilityDto.previousWaterMeter;
    }
    
    if (updateUtilityDto.currentWaterMeter !== undefined) {
      utility.currentwatermeter = updateUtilityDto.currentWaterMeter;
    }
    
    // Validate meter readings
    if (utility.currentelectricitymeter < utility.previouselectricitymeter) {
      throw new BadRequestException(`Chỉ số điện mới không thể nhỏ hơn chỉ số điện cũ`);
    }
    
    if (utility.currentwatermeter < utility.previouswatermeter) {
      throw new BadRequestException(`Chỉ số nước mới không thể nhỏ hơn chỉ số nước cũ`);
    }
    
    return this.utilitiesRepository.save(utility);
  }

  async remove(id: number): Promise<void> {
    const utility = await this.findOne(id);
    
    // Check if there are related invoices
    if (utility.invoices && utility.invoices.length > 0) {
      throw new BadRequestException(`Không thể xóa ghi nhận tiện ích này vì có hóa đơn liên quan`);
    }
    
    await this.utilitiesRepository.remove(utility);
  }

  async calculateUsage(id: number): Promise<{ electricityUsage: number; waterUsage: number }> {
    const utility = await this.findOne(id);
    
    const electricityUsage = utility.currentelectricitymeter - utility.previouselectricitymeter;
    const waterUsage = utility.currentwatermeter - utility.previouswatermeter;
    
    return {
      electricityUsage,
      waterUsage
    };
  }

  async getUtilityStatistics(): Promise<any> {
    // Monthly usage statistics
    const monthlyStats = await this.utilitiesRepository
      .createQueryBuilder('utilities')
      .select("TO_CHAR(utilities.startdate, 'YYYY-MM')", 'month')
      .addSelect('SUM(utilities.currentelectricitymeter - utilities.previouselectricitymeter)', 'totalElectricityUsage')
      .addSelect('SUM(utilities.currentwatermeter - utilities.previouswatermeter)', 'totalWaterUsage')
      .addSelect('COUNT(utilities.utilitiesid)', 'count')
      .groupBy("TO_CHAR(utilities.startdate, 'YYYY-MM')")
      .orderBy("TO_CHAR(utilities.startdate, 'YYYY-MM')")
      .getRawMany();
    
    // Room with highest electricity usage
    const highestElectricityRooms = await this.utilitiesRepository
      .createQueryBuilder('utilities')
      .leftJoinAndSelect('utilities.room', 'room')
      .leftJoinAndSelect('room.building', 'building')
      .select('room.roomid', 'roomId')
      .addSelect('room.roomnumber', 'roomNumber')
      .addSelect('building.buildingname', 'buildingName')
      .addSelect('SUM(utilities.currentelectricitymeter - utilities.previouselectricitymeter)', 'totalUsage')
      .groupBy('room.roomid')
      .addGroupBy('room.roomnumber')
      .addGroupBy('building.buildingname')
      .orderBy('totalUsage', 'DESC')
      .limit(5)
      .getRawMany();
    
    // Room with highest water usage
    const highestWaterRooms = await this.utilitiesRepository
      .createQueryBuilder('utilities')
      .leftJoinAndSelect('utilities.room', 'room')
      .leftJoinAndSelect('room.building', 'building')
      .select('room.roomid', 'roomId')
      .addSelect('room.roomnumber', 'roomNumber')
      .addSelect('building.buildingname', 'buildingName')
      .addSelect('SUM(utilities.currentwatermeter - utilities.previouswatermeter)', 'totalUsage')
      .groupBy('room.roomid')
      .addGroupBy('room.roomnumber')
      .addGroupBy('building.buildingname')
      .orderBy('totalUsage', 'DESC')
      .limit(5)
      .getRawMany();
      
    return {
      monthlyStats,
      highestElectricityRooms,
      highestWaterRooms
    };
  }
}
