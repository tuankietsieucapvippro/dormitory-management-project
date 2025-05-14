import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UsePipes, ValidationPipe, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { UtilitiesService } from './utilities.service';
import { CreateUtilityDto } from './dto/create-utility.dto';
import { UpdateUtilityDto } from './dto/update-utility.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('utilities')
@Controller('utilities')
export class UtilitiesController {
  constructor(private readonly utilitiesService: UtilitiesService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Create a new utility record' })
  @ApiResponse({ status: 201, description: 'Utility record created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createUtilityDto: CreateUtilityDto) {
    return this.utilitiesService.create(createUtilityDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all utility records with optional pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Returns all utility records' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
  @ApiQuery({ name: 'roomId', required: false, type: Number, description: 'Room ID' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Sort by field' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort order' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('roomId') roomId?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    if (page || limit || search || roomId || startDate || endDate || sortBy || sortOrder) {
      // Validate date parameters
      if ((startDate && !endDate) || (!startDate && endDate)) {
        throw new BadRequestException('Cả startDate và endDate phải được cung cấp');
      }

      return this.utilitiesService.findAllWithPagination({
        page: page ? +page : 1,
        limit: limit ? +limit : 10,
        search,
        roomId: roomId ? +roomId : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        sortBy: sortBy || 'utilitiesid',
        sortOrder: sortOrder || 'DESC',
      });
    }
    
    return this.utilitiesService.findAll();
  }

  @Get('by-room/:roomId')
  @ApiOperation({ summary: 'Get utility records by room ID' })
  @ApiResponse({ status: 200, description: 'Returns utility records for the specified room' })
  @ApiParam({ name: 'roomId', type: Number, description: 'Room ID' })
  findByRoom(@Param('roomId', ParseIntPipe) roomId: number) {
    return this.utilitiesService.findByRoom(roomId);
  }

  @Get(':id/calculate-usage')
  @ApiOperation({ summary: 'Calculate electricity and water usage from a utility record' })
  @ApiResponse({ status: 200, description: 'Returns the calculated usage' })
  @ApiParam({ name: 'id', type: Number, description: 'Utility ID' })
  calculateUsage(@Param('id', ParseIntPipe) id: number) {
    return this.utilitiesService.calculateUsage(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get utility record by ID' })
  @ApiResponse({ status: 200, description: 'Returns the utility record with the specified ID' })
  @ApiResponse({ status: 404, description: 'Utility record not found' })
  @ApiParam({ name: 'id', type: Number, description: 'Utility ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.utilitiesService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Update a utility record' })
  @ApiResponse({ status: 200, description: 'Utility record updated successfully' })
  @ApiResponse({ status: 404, description: 'Utility record not found' })
  @ApiParam({ name: 'id', type: Number, description: 'Utility ID' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUtilityDto: UpdateUtilityDto) {
    return this.utilitiesService.update(id, updateUtilityDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a utility record' })
  @ApiResponse({ status: 200, description: 'Utility record deleted successfully' })
  @ApiResponse({ status: 404, description: 'Utility record not found' })
  @ApiParam({ name: 'id', type: Number, description: 'Utility ID' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.utilitiesService.remove(id);
    return {
      statusCode: 200,
      message: `Đã xóa ghi nhận tiện ích có ID ${id} thành công`,
    };
  }
}
