import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpStatus, HttpCode, ValidationPipe, UsePipes, NotFoundException, BadRequestException } from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() createRoomDto: CreateRoomDto) {
    try {
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Tạo phòng thành công',
        data: await this.roomService.create(createRoomDto)
      };
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new BadRequestException('Tên phòng đã tồn tại trong tòa nhà này');
      }
      if (error.code === '23503') { // Foreign key violation
        throw new BadRequestException('Tòa nhà hoặc loại phòng không tồn tại');
      }
      throw new BadRequestException(`Không thể tạo phòng: ${error.message}`);
    }
  }

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('buildingId') buildingId?: number,
    @Query('status') status?: string,
    @Query('sortBy') sortBy: string = 'roomname',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC'
  ) {
    const [data, total] = await this.roomService.findAllWithPagination({
      page,
      limit,
      search,
      buildingId,
      status,
      sortBy,
      sortOrder
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách phòng thành công',
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  @Get('statistics')
  async getRoomStatistics() {
    const data = await this.roomService.getRoomStatistics();
    
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy thống kê phòng thành công',
      data
    };
  }

  @Get('by-building/:buildingId')
  async findByBuilding(@Param('buildingId') buildingId: string) {
    const data = await this.roomService.findByBuilding(+buildingId);
    
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách phòng theo tòa nhà thành công',
      data
    };
  }

  @Get('available-by-building/:buildingId')
  async findAvailableByBuilding(@Param('buildingId') buildingId: string) {
    const data = await this.roomService.findAvailableByBuilding(+buildingId);
    
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách phòng trống theo tòa nhà thành công',
      data
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return {
        statusCode: HttpStatus.OK,
        message: 'Lấy thông tin phòng thành công',
        data: await this.roomService.findOne(+id)
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Không tìm thấy phòng với ID ${id}`);
    }
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    try {
      return {
        statusCode: HttpStatus.OK,
        message: 'Cập nhật phòng thành công',
        data: await this.roomService.update(+id, updateRoomDto)
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.code === '23505') { // Unique violation
        throw new BadRequestException('Tên phòng đã tồn tại trong tòa nhà này');
      }
      if (error.code === '23503') { // Foreign key violation
        throw new BadRequestException('Tòa nhà hoặc loại phòng không tồn tại');
      }
      throw new BadRequestException(`Không thể cập nhật phòng: ${error.message}`);
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    try {
      await this.roomService.remove(+id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Không thể xóa phòng: ${error.message}`);
    }
  }

  @Get('count/by-building/:buildingId')
  async countByBuilding(@Param('buildingId') buildingId: string) {
    const count = await this.roomService.countByBuilding(+buildingId);
    
    return {
      statusCode: HttpStatus.OK,
      message: 'Đếm số phòng theo tòa nhà thành công',
      data: { count }
    };
  }

  @Get('count/by-status/:status')
  async countByStatus(@Param('status') status: string) {
    const count = await this.roomService.countByStatus(status);
    
    return {
      statusCode: HttpStatus.OK,
      message: 'Đếm số phòng theo trạng thái thành công',
      data: { count }
    };
  }
}
