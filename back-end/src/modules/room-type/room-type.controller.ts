import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ValidationPipe, UsePipes } from '@nestjs/common';
import { RoomTypeService } from './room-type.service';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { UpdateRoomTypeDto } from './dto/update-room-type.dto';

@Controller('room-types')
export class RoomTypeController {
  constructor(private readonly roomTypeService: RoomTypeService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createRoomTypeDto: CreateRoomTypeDto) {
    return this.roomTypeService.create(createRoomTypeDto);
  }

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('gender') gender?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    if (page || limit || search || gender || sortBy || sortOrder) {
      return this.roomTypeService.findAllWithPagination({
        page: page ? +page : 1,
        limit: limit ? +limit : 10,
        search,
        gender,
        sortBy: sortBy || 'roomtypeid',
        sortOrder: sortOrder || 'ASC',
      });
    }
    
    return this.roomTypeService.findAll();
  }

  @Get('statistics')
  getRoomTypeStatistics() {
    return this.roomTypeService.getRoomTypeStatistics();
  }

  @Get('by-gender/:gender')
  findByGender(@Param('gender') gender: string) {
    return this.roomTypeService.findByGender(gender);
  }

  @Get('count-by-gender')
  countByGender() {
    return this.roomTypeService.countByGender();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomTypeService.findOne(+id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  update(@Param('id') id: string, @Body() updateRoomTypeDto: UpdateRoomTypeDto) {
    return this.roomTypeService.update(+id, updateRoomTypeDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.roomTypeService.remove(+id);
    return {
      statusCode: 200,
      message: `Đã xóa loại phòng có ID ${id} thành công`,
    };
  }
}
