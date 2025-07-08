import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpStatus, HttpCode, ValidationPipe, UsePipes, NotFoundException, BadRequestException } from '@nestjs/common';
import { BuildingService } from './building.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';

@Controller('buildings')
export class BuildingController {
  constructor(private readonly buildingService: BuildingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() createBuildingDto: CreateBuildingDto) {
    try {
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Tạo tòa nhà thành công',
        data: await this.buildingService.create(createBuildingDto)
      };
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new BadRequestException('Tên tòa nhà đã tồn tại');
      }
      throw new BadRequestException(`Không thể tạo tòa nhà: ${error.message}`);
    }
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
    try {
      return {
        statusCode: HttpStatus.OK,
        message: 'Lấy thông tin tòa nhà thành công',
        data: await this.buildingService.findOne(+id, includeRooms)
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Không tìm thấy tòa nhà với ID ${id}`);
    }
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(@Param('id') id: string, @Body() updateBuildingDto: UpdateBuildingDto) {
    try {
      return {
        statusCode: HttpStatus.OK,
        message: 'Cập nhật tòa nhà thành công',
        data: await this.buildingService.update(+id, updateBuildingDto)
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.code === '23505') { // Unique violation
        throw new BadRequestException('Tên tòa nhà đã tồn tại');
      }
      throw new BadRequestException(`Không thể cập nhật tòa nhà: ${error.message}`);
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    try {
      await this.buildingService.remove(+id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Không thể xóa tòa nhà: ${error.message}`);
    }
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
