import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UsePipes, ValidationPipe, ParseIntPipe } from '@nestjs/common';
import { PriceListService } from './price-list.service';
import { CreatePriceListDto } from './dto/create-price-list.dto';
import { UpdatePriceListDto } from './dto/update-price-list.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('price-list')
@Controller('price-list')
export class PriceListController {
  constructor(private readonly priceListService: PriceListService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Tạo mới một bảng giá' })
  @ApiResponse({ status: 201, description: 'Bảng giá được tạo thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ hoặc loại chi phí đã tồn tại' })
  create(@Body() createPriceListDto: CreatePriceListDto) {
    return this.priceListService.create(createPriceListDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách bảng giá với tùy chọn phân trang và tìm kiếm' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách bảng giá' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Số trang' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số bản ghi mỗi trang' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Từ khóa tìm kiếm' })
  @ApiQuery({ name: 'costType', required: false, type: String, description: 'Loại chi phí' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Sắp xếp theo trường' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Thứ tự sắp xếp' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('costType') costType?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    if (page || limit || search || costType || sortBy || sortOrder) {
      return this.priceListService.findAllWithPagination({
        page: page ? +page : 1,
        limit: limit ? +limit : 10,
        search,
        costType,
        sortBy: sortBy || 'priceid',
        sortOrder: sortOrder || 'ASC',
      });
    }
    
    return this.priceListService.findAll();
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Lấy thống kê bảng giá' })
  @ApiResponse({ status: 200, description: 'Trả về thống kê bảng giá' })
  getPriceStatistics() {
    return this.priceListService.getPriceStatistics();
  }

  @Get('by-type/:costType')
  @ApiOperation({ summary: 'Tìm bảng giá theo loại chi phí' })
  @ApiResponse({ status: 200, description: 'Trả về bảng giá với loại chi phí chỉ định' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bảng giá với loại chi phí chỉ định' })
  @ApiParam({ name: 'costType', description: 'Loại chi phí cần tìm' })
  findByCostType(@Param('costType') costType: string) {
    return this.priceListService.findByCostType(costType);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Tìm bảng giá theo ID' })
  @ApiResponse({ status: 200, description: 'Trả về bảng giá với ID chỉ định' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bảng giá với ID chỉ định' })
  @ApiParam({ name: 'id', description: 'ID của bảng giá cần tìm' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.priceListService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Cập nhật bảng giá' })
  @ApiResponse({ status: 200, description: 'Bảng giá được cập nhật thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ hoặc loại chi phí đã tồn tại' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bảng giá với ID chỉ định' })
  @ApiParam({ name: 'id', description: 'ID của bảng giá cần cập nhật' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePriceListDto: UpdatePriceListDto) {
    return this.priceListService.update(id, updatePriceListDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa bảng giá' })
  @ApiResponse({ status: 200, description: 'Bảng giá được xóa thành công' })
  @ApiResponse({ status: 400, description: 'Không thể xóa bảng giá đang được sử dụng' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bảng giá với ID chỉ định' })
  @ApiParam({ name: 'id', description: 'ID của bảng giá cần xóa' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.priceListService.remove(id);
  }
}
