import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsOrder } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';

interface PaginationOptions {
  page: number;
  limit: number;
  search?: string;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
}

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  /**
   * Tạo mới vai trò
   * @param createRoleDto Dữ liệu để tạo vai trò
   * @returns Vai trò đã tạo
   */
  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    try {
      // Kiểm tra xem tên vai trò đã tồn tại chưa
      const existingRole = await this.roleRepository.findOne({
        where: { rolename: createRoleDto.roleName }
      });

      if (existingRole) {
        throw new BadRequestException(`Vai trò với tên "${createRoleDto.roleName}" đã tồn tại`);
      }

      // Tạo và lưu vai trò mới
      const role = this.roleRepository.create({
        rolename: createRoleDto.roleName
      });

      return this.roleRepository.save(role);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Không thể tạo vai trò: ${error.message}`);
    }
  }

  /**
   * Lấy tất cả vai trò
   * @returns Danh sách vai trò
   */
  async findAll(): Promise<Role[]> {
    try {
      return this.roleRepository.find({
        relations: ['accounts']
      });
    } catch (error) {
      throw new BadRequestException(`Không thể lấy danh sách vai trò: ${error.message}`);
    }
  }

  /**
   * Lấy danh sách vai trò có phân trang
   * @param options Tùy chọn phân trang
   * @returns Danh sách vai trò và thông tin phân trang
   */
  async findAllWithPagination(options: PaginationOptions): Promise<{ data: Role[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, search, sortBy = 'roleid', sortOrder = 'ASC' } = options;
    
    const skip = (page - 1) * limit;
    
    try {
      // Xây dựng điều kiện tìm kiếm
      const whereConditions: any = {};
      
      if (search) {
        whereConditions.rolename = ILike(`%${search}%`);
      }
      
      // Xây dựng điều kiện sắp xếp
      const order: FindOptionsOrder<Role> = {};
      order[sortBy] = sortOrder;

      // Tìm kiếm vai trò với phân trang
      const [result, total] = await this.roleRepository.findAndCount({
        where: whereConditions,
        relations: ['accounts'],
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
    } catch (error) {
      throw new BadRequestException(`Không thể lấy danh sách vai trò: ${error.message}`);
    }
  }

  /**
   * Tìm vai trò theo ID
   * @param id ID của vai trò
   * @returns Vai trò
   */
  async findOne(id: number): Promise<Role> {
    try {
      const role = await this.roleRepository.findOne({
        where: { roleid: id },
        relations: ['accounts']
      });
      
      if (!role) {
        throw new NotFoundException(`Không tìm thấy vai trò với ID ${id}`);
      }
      
      return role;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Không thể tìm vai trò: ${error.message}`);
    }
  }

  /**
   * Tìm vai trò theo tên
   * @param name Tên của vai trò
   * @returns Vai trò
   */
  async findByName(name: string): Promise<Role> {
    try {
      const role = await this.roleRepository.findOne({
        where: { rolename: name },
        relations: ['accounts']
      });
      
      if (!role) {
        throw new NotFoundException(`Không tìm thấy vai trò với tên ${name}`);
      }
      
      return role;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Không thể tìm vai trò: ${error.message}`);
    }
  }

  /**
   * Cập nhật vai trò
   * @param id ID của vai trò
   * @param updateRoleDto Dữ liệu cập nhật
   * @returns Vai trò đã cập nhật
   */
  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    try {
      // Kiểm tra vai trò có tồn tại không
      const existingRole = await this.findOne(id);
      
      if (updateRoleDto.roleName) {
        // Kiểm tra xem tên mới đã tồn tại chưa (trừ vai trò hiện tại)
        const roleWithSameName = await this.roleRepository.findOne({
          where: { rolename: updateRoleDto.roleName, roleid: id }
        });
        
        if (roleWithSameName && roleWithSameName.roleid !== id) {
          throw new BadRequestException(`Vai trò với tên "${updateRoleDto.roleName}" đã tồn tại`);
        }
        
        // Cập nhật tên vai trò
        existingRole.rolename = updateRoleDto.roleName;
      }
      
      // Lưu vai trò đã cập nhật
      return this.roleRepository.save(existingRole);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Không thể cập nhật vai trò: ${error.message}`);
    }
  }

  /**
   * Xóa vai trò
   * @param id ID của vai trò
   */
  async remove(id: number): Promise<void> {
    try {
      // Kiểm tra vai trò có tồn tại không
      const role = await this.findOne(id);
      
      // Kiểm tra xem vai trò có đang được sử dụng bởi tài khoản nào không
      if (role.accounts && role.accounts.length > 0) {
        throw new BadRequestException(
          `Không thể xóa vai trò này vì đang được sử dụng bởi ${role.accounts.length} tài khoản`
        );
      }
      
      // Xóa vai trò
      await this.roleRepository.remove(role);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Không thể xóa vai trò: ${error.message}`);
    }
  }
}
