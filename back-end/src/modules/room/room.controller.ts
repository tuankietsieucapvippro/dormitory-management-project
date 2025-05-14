import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createRoomDto: CreateRoomDto) {
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Tạo phòng thành công',
      data: await this.roomService.create(createRoomDto)
    };
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
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy thông tin phòng thành công',
      data: await this.roomService.findOne(+id)
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Cập nhật phòng thành công',
      data: await this.roomService.update(+id, updateRoomDto)
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.roomService.remove(+id);
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
