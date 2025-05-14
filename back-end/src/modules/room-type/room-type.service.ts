import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsOrder } from 'typeorm';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { UpdateRoomTypeDto } from './dto/update-room-type.dto';
import { RoomType } from './entities/room-type.entity';

interface PaginationOptions {
  page: number;
  limit: number;
  search?: string;
  gender?: string;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
}

@Injectable()
export class RoomTypeService {
  constructor(
    @InjectRepository(RoomType)
    private roomTypeRepository: Repository<RoomType>,
  ) {}

  async create(createRoomTypeDto: CreateRoomTypeDto): Promise<RoomType> {
    const roomType = this.roomTypeRepository.create({
      roomtypename: createRoomTypeDto.roomTypeName,
      price: createRoomTypeDto.price?.toString(),
      description: createRoomTypeDto.description,
      gender: createRoomTypeDto.gender,
    });

    return this.roomTypeRepository.save(roomType);
  }

  async findAll(): Promise<RoomType[]> {
    return this.roomTypeRepository.find({
      relations: ['rooms'],
    });
  }

  async findAllWithPagination(options: PaginationOptions): Promise<{ data: RoomType[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, search, gender, sortBy = 'roomtypeid', sortOrder = 'ASC' } = options;
    
    const skip = (page - 1) * limit;
    
    const whereConditions: any = {};
    
    if (search) {
      whereConditions.roomtypename = ILike(`%${search}%`);
    }
    
    if (gender) {
      whereConditions.gender = gender;
    }
    
    const order: FindOptionsOrder<RoomType> = {};
    order[sortBy] = sortOrder;
    
    const [result, total] = await this.roomTypeRepository.findAndCount({
      where: whereConditions,
      relations: ['rooms'],
      skip,
      take: limit,
      order,
    });
    
    return {
      data: result,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<RoomType> {
    const roomType = await this.roomTypeRepository.findOne({
      where: { roomtypeid: id },
      relations: ['rooms'],
    });
    
    if (!roomType) {
      throw new NotFoundException(`Không tìm thấy loại phòng với ID ${id}`);
    }
    
    return roomType;
  }

  async findByGender(gender: string): Promise<RoomType[]> {
    return this.roomTypeRepository.find({
      where: { gender },
      relations: ['rooms'],
    });
  }

  async update(id: number, updateRoomTypeDto: UpdateRoomTypeDto): Promise<RoomType> {
    const roomType = await this.findOne(id);
    
    if (updateRoomTypeDto.roomTypeName) {
      roomType.roomtypename = updateRoomTypeDto.roomTypeName;
    }
    
    if (updateRoomTypeDto.price !== undefined) {
      roomType.price = updateRoomTypeDto.price?.toString();
    }
    
    if (updateRoomTypeDto.description !== undefined) {
      roomType.description = updateRoomTypeDto.description;
    }
    
    if (updateRoomTypeDto.gender !== undefined) {
      roomType.gender = updateRoomTypeDto.gender;
    }
    
    return this.roomTypeRepository.save(roomType);
  }

  async remove(id: number): Promise<void> {
    const roomType = await this.findOne(id);
    await this.roomTypeRepository.remove(roomType);
  }

  async countByGender(): Promise<{ gender: string; count: number }[]> {
    const result = await this.roomTypeRepository
      .createQueryBuilder('roomType')
      .select('roomType.gender', 'gender')
      .addSelect('COUNT(roomType.roomtypeid)', 'count')
      .groupBy('roomType.gender')
      .getRawMany();
    
    return result;
  }

  async getRoomTypeStatistics(): Promise<any> {
    // Số lượng phòng của mỗi loại phòng
    const roomCounts = await this.roomTypeRepository
      .createQueryBuilder('roomType')
      .leftJoinAndSelect('roomType.rooms', 'room')
      .select('roomType.roomtypeid', 'id')
      .addSelect('roomType.roomtypename', 'name')
      .addSelect('COUNT(room.roomid)', 'roomCount')
      .groupBy('roomType.roomtypeid')
      .getRawMany();
    
    // Giá trung bình của mỗi loại phòng theo giới tính
    const priceByGender = await this.roomTypeRepository
      .createQueryBuilder('roomType')
      .select('roomType.gender', 'gender')
      .addSelect('AVG(roomType.price::numeric)', 'averagePrice')
      .groupBy('roomType.gender')
      .getRawMany();
    
    return {
      roomCounts,
      priceByGender
    };
  }
}
