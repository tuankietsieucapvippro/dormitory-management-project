import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, In } from 'typeorm';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Room } from './entities/room.entity';

interface PaginationOptions {
  page: number;
  limit: number;
  search?: string;
  buildingId?: number;
  status?: string;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
}

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
  ) {}

  async create(createRoomDto: CreateRoomDto): Promise<Room> {
    // Chuyển đổi từ dto sang entity
    const room = this.roomRepository.create({
      roomname: createRoomDto.roomName,
      buildingid: createRoomDto.buildingId,
      roomtypeid: createRoomDto.roomTypeId,
      status: createRoomDto.status,
      bedcount: createRoomDto.bedCount,
    });

    // Lưu vào database
    return this.roomRepository.save(room);
  }

  async findAll(): Promise<Room[]> {
    // Truy vấn tất cả các phòng từ database
    return this.roomRepository.find({
      relations: ['building', 'roomtype']
    });
  }

  async findAllWithPagination(
    options: PaginationOptions
  ): Promise<[Room[], number]> {
    const { page, limit, search, buildingId, status, sortBy, sortOrder } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.roomRepository.createQueryBuilder('room')
      .leftJoinAndSelect('room.building', 'building')
      .leftJoinAndSelect('room.roomtype', 'roomtype');

    // Thêm điều kiện tìm kiếm nếu có
    if (search) {
      queryBuilder.andWhere(
        '(room.roomname ILIKE :search OR ' +
        'building.buildingname ILIKE :search OR ' +
        'roomtype.roomtypename ILIKE :search OR ' +
        'room.status ILIKE :search)',
        {
          search: `%${search}%`,
        }
      );
    }

    // Lọc theo tòa nhà nếu có
    if (buildingId) {
      queryBuilder.andWhere('room.buildingid = :buildingId', { buildingId });
    }

    // Lọc theo trạng thái nếu có
    if (status) {
      queryBuilder.andWhere('room.status = :status', { status });
    }

    // Thêm sắp xếp
    if (['roomid', 'roomname', 'status', 'bedcount'].includes(sortBy)) {
      queryBuilder.orderBy(`room.${sortBy}`, sortOrder);
    } else if (sortBy === 'buildingName') {
      queryBuilder.orderBy('building.buildingname', sortOrder);
    } else if (sortBy === 'roomTypeName') {
      queryBuilder.orderBy('roomtype.typename', sortOrder);
    } else {
      queryBuilder.orderBy('room.roomname', sortOrder);
    }

    // Thêm phân trang
    queryBuilder.skip(skip).take(limit);

    // Thực hiện truy vấn và đếm tổng số bản ghi
    const [rooms, total] = await queryBuilder.getManyAndCount();

    return [rooms, total];
  }

  async findOne(id: number): Promise<Room> {
    const room = await this.roomRepository.findOne({
      where: { roomid: id },
      relations: ['building', 'roomtype', 'utilities', 'roomregistrations']
    });

    if (!room) {
      throw new NotFoundException(`Không tìm thấy phòng với ID ${id}`);
    }

    return room;
  }

  async findByBuilding(buildingId: number): Promise<Room[]> {
    return this.roomRepository.find({
      where: { buildingid: buildingId },
      relations: ['roomtype']
    });
  }

  async findAvailableByBuilding(buildingId: number): Promise<Room[]> {
    return this.roomRepository.find({
      where: { 
        buildingid: buildingId,
        status: 'available'
      },
      relations: ['roomtype']
    });
  }

  async update(id: number, updateRoomDto: UpdateRoomDto): Promise<Room> {
    // Kiểm tra phòng có tồn tại không
    await this.findOne(id);
    
    // Tạo đối tượng chứa dữ liệu cần cập nhật
    const updateData: Partial<Room> = {};
    
    if (updateRoomDto.roomName) {
      updateData.roomname = updateRoomDto.roomName;
    }
    
    if (updateRoomDto.buildingId) {
      updateData.buildingid = updateRoomDto.buildingId;
    }
    
    if (updateRoomDto.status) {
      updateData.status = updateRoomDto.status;
    }
    
    if (updateRoomDto.bedCount) {
      updateData.bedcount = updateRoomDto.bedCount;
    }

    // Cập nhật trong database
    await this.roomRepository.update(id, updateData);
    
    // Nếu có roomTypeId, cập nhật quan hệ với roomtype
    if (updateRoomDto.roomTypeId) {
      const room = await this.findOne(id);
      room.roomtype = { roomtypeid: updateRoomDto.roomTypeId } as any;
      await this.roomRepository.save(room);
    }
    
    // Trả về đối tượng đã cập nhật
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    // Kiểm tra phòng có tồn tại không
    const room = await this.findOne(id);
    
    // Xóa phòng từ database
    await this.roomRepository.remove(room);
  }

  async countByBuilding(buildingId: number): Promise<number> {
    return this.roomRepository.count({
      where: { buildingid: buildingId }
    });
  }

  async countByStatus(status: string): Promise<number> {
    return this.roomRepository.count({
      where: { status }
    });
  }

  async getRoomStatistics(): Promise<any[]> {
    const result = await this.roomRepository
      .createQueryBuilder('room')
      .select('room.status', 'status')
      .addSelect('COUNT(room.roomid)', 'count')
      .groupBy('room.status')
      .getRawMany();
    
    return result;
  }
}
