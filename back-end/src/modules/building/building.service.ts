import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { Building } from './entities/building.entity';

interface PaginationOptions {
  page: number;
  limit: number;
  search?: string;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
}

@Injectable()
export class BuildingService {
  constructor(
    @InjectRepository(Building)
    private buildingRepository: Repository<Building>,
  ) {}

  async create(createBuildingDto: CreateBuildingDto): Promise<Building> {
    // Chuyển đổi từ dto sang entity
    const building = this.buildingRepository.create({
      buildingname: createBuildingDto.buildingname,
      description: createBuildingDto.description,
    });

    // Lưu vào database
    return this.buildingRepository.save(building);
  }

  async findAll(): Promise<Building[]> {
    // Truy vấn tất cả các tòa nhà từ database
    return this.buildingRepository.find();
  }

  async findAllWithPagination(
    options: PaginationOptions,
    includeRooms = false
  ): Promise<[Building[], number]> {
    const { page, limit, search, sortBy, sortOrder } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.buildingRepository.createQueryBuilder('building');

    // Thêm điều kiện tìm kiếm nếu có
    if (search) {
      queryBuilder.where('building.buildingname ILIKE :search OR building.description ILIKE :search', {
        search: `%${search}%`,
      });
    }

    // Load relations nếu cần
    if (includeRooms) {
      queryBuilder.leftJoinAndSelect('building.rooms', 'room');
    }

    // Thêm sắp xếp
    queryBuilder.orderBy(`building.${sortBy}`, sortOrder);

    // Thêm phân trang
    queryBuilder.skip(skip).take(limit);

    // Thực hiện truy vấn và đếm tổng số bản ghi
    const [buildings, total] = await queryBuilder.getManyAndCount();

    return [buildings, total];
  }

  async findOne(id: number, includeRooms = false): Promise<Building> {
    // Tìm một tòa nhà theo ID
    const queryBuilder = this.buildingRepository.createQueryBuilder('building')
      .where('building.buildingid = :id', { id });

    if (includeRooms) {
      queryBuilder.leftJoinAndSelect('building.rooms', 'room');
    }

    const building = await queryBuilder.getOne();

    if (!building) {
      throw new NotFoundException(`Không tìm thấy tòa nhà với ID ${id}`);
    }

    return building;
  }

  async update(id: number, updateBuildingDto: UpdateBuildingDto): Promise<Building> {
    // Tạo đối tượng chứa dữ liệu cần cập nhật
    const updateData: Partial<Building> = {};

    if (updateBuildingDto.buildingname) {
      updateData.buildingname = updateBuildingDto.buildingname;
    }

    if (updateBuildingDto.description !== undefined) {
      updateData.description = updateBuildingDto.description;
    }

    // Cập nhật trong database
    await this.buildingRepository.update(id, updateData);

    // Trả về đối tượng đã cập nhật
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    // Kiểm tra tòa nhà có tồn tại không
    const building = await this.findOne(id);
    
    // Xóa tòa nhà từ database
    await this.buildingRepository.remove(building);
  }

  async findRooms(buildingId: number): Promise<any[]> {
    const building = await this.findOne(buildingId, true);
    return building.rooms || [];
  }

  async findAvailableRooms(buildingId: number): Promise<any[]> {
    const building = await this.buildingRepository.createQueryBuilder('building')
      .leftJoinAndSelect('building.rooms', 'room')
      .where('building.buildingid = :id', { id: buildingId })
      .andWhere('room.status = :status', { status: 'available' })
      .getOne();

    if (!building) {
      throw new NotFoundException(`Không tìm thấy tòa nhà với ID ${buildingId}`);
    }

    return building.rooms || [];
  }
}
