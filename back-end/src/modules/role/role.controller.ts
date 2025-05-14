import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  ParseIntPipe, 
  ValidationPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpStatus,
  HttpCode,
  BadRequestException,
  NotFoundException
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery, 
  ApiBody
} from '@nestjs/swagger';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';

@ApiTags('roles')
@Controller('roles')
@UseInterceptors(ClassSerializerInterceptor)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo mới vai trò' })
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({ status: 201, description: 'Vai trò đã được tạo thành công', type: Role })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ hoặc vai trò đã tồn tại' })
  async create(@Body(ValidationPipe) createRoleDto: CreateRoleDto): Promise<Role> {
    try {
      return await this.roleService.create(createRoleDto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Lỗi khi tạo vai trò: ${error.message}`);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả vai trò' })
  @ApiResponse({ status: 200, description: 'Danh sách vai trò', type: [Role] })
  async findAll(): Promise<Role[]> {
    try {
      return await this.roleService.findAll();
    } catch (error) {
      throw new BadRequestException(`Lỗi khi lấy danh sách vai trò: ${error.message}`);
    }
  }

  @Get('paginate')
  @ApiOperation({ summary: 'Lấy danh sách vai trò có phân trang và tìm kiếm' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Số trang (mặc định: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số lượng bản ghi mỗi trang (mặc định: 10)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Từ khóa tìm kiếm tên vai trò' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Trường sắp xếp (mặc định: roleid)', enum: ['roleid', 'rolename'] })
  @ApiQuery({ name: 'sortOrder', required: false, type: String, description: 'Thứ tự sắp xếp (mặc định: ASC)', enum: ['ASC', 'DESC'] })
  @ApiResponse({ status: 200, description: 'Danh sách vai trò có phân trang' })
  async findAllWithPagination(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
    @Query('search') search?: string,
    @Query('sortBy') sortBy = 'roleid',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
  ): Promise<{ data: Role[]; total: number; page: number; limit: number }> {
    try {
      return await this.roleService.findAllWithPagination({
        page,
        limit,
        search,
        sortBy,
        sortOrder,
      });
    } catch (error) {
      throw new BadRequestException(`Lỗi khi lấy danh sách vai trò theo trang: ${error.message}`);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin vai trò theo ID' })
  @ApiParam({ name: 'id', description: 'ID của vai trò', type: Number })
  @ApiResponse({ status: 200, description: 'Vai trò đã được tìm thấy', type: Role })
  @ApiResponse({ status: 404, description: 'Không tìm thấy vai trò' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Role> {
    try {
      return await this.roleService.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Lỗi khi tìm vai trò: ${error.message}`);
    }
  }

  @Get('by-name/:name')
  @ApiOperation({ summary: 'Lấy thông tin vai trò theo tên' })
  @ApiParam({ name: 'name', description: 'Tên của vai trò', type: String })
  @ApiResponse({ status: 200, description: 'Vai trò đã được tìm thấy', type: Role })
  @ApiResponse({ status: 404, description: 'Không tìm thấy vai trò' })
  async findByName(@Param('name') name: string): Promise<Role> {
    try {
      return await this.roleService.findByName(name);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Lỗi khi tìm vai trò: ${error.message}`);
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin vai trò' })
  @ApiParam({ name: 'id', description: 'ID của vai trò', type: Number })
  @ApiBody({ type: UpdateRoleDto })
  @ApiResponse({ status: 200, description: 'Vai trò đã được cập nhật', type: Role })
  @ApiResponse({ status: 404, description: 'Không tìm thấy vai trò' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ hoặc vai trò đã tồn tại' })
  async update(
    @Param('id', ParseIntPipe) id: number, 
    @Body(ValidationPipe) updateRoleDto: UpdateRoleDto
  ): Promise<Role> {
    try {
      return await this.roleService.update(id, updateRoleDto);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Lỗi khi cập nhật vai trò: ${error.message}`);
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa vai trò' })
  @ApiParam({ name: 'id', description: 'ID của vai trò', type: Number })
  @ApiResponse({ status: 204, description: 'Vai trò đã được xóa' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy vai trò' })
  @ApiResponse({ status: 400, description: 'Không thể xóa vai trò đang được sử dụng' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    try {
      await this.roleService.remove(id);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Lỗi khi xóa vai trò: ${error.message}`);
    }
  }
}
