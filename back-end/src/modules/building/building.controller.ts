import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { BuildingService } from './building.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';

@Controller('buildings')
export class BuildingController {
  constructor(private readonly buildingService: BuildingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createBuildingDto: CreateBuildingDto) {
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Tạo tòa nhà thành công',
      data: await this.buildingService.create(createBuildingDto)
    };
  }

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('sortBy') sortBy: string = 'buildingname',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
    @Query('includeRooms') includeRooms: boolean = false
  ) {
    const [data, total] = await this.buildingService.findAllWithPagination(
      {
        page,
        limit,
        search,
        sortBy,
        sortOrder
      },
      includeRooms
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách tòa nhà thành công',
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query('includeRooms') includeRooms: boolean = false
  ) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy thông tin tòa nhà thành công',
      data: await this.buildingService.findOne(+id, includeRooms)
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateBuildingDto: UpdateBuildingDto) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Cập nhật tòa nhà thành công',
      data: await this.buildingService.update(+id, updateBuildingDto)
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.buildingService.remove(+id);
  }

  @Get(':id/rooms')
  async findRooms(@Param('id') id: string) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách phòng trong tòa nhà thành công',
      data: await this.buildingService.findRooms(+id)
    };
  }

  @Get(':id/available-rooms')
  async findAvailableRooms(@Param('id') id: string) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách phòng còn trống trong tòa nhà thành công',
      data: await this.buildingService.findAvailableRooms(+id)
    };
  }
}
