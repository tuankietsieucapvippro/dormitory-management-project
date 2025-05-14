import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UsePipes, ValidationPipe, ParseIntPipe } from '@nestjs/common';
import { SystemLogService } from './system-log.service';
import { CreateSystemLogDto } from './dto/create-system-log.dto';
import { UpdateSystemLogDto } from './dto/update-system-log.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('system-log')
@Controller('system-log')
export class SystemLogController {
  constructor(private readonly systemLogService: SystemLogService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Tạo mới một log hệ thống' })
  @ApiResponse({ status: 201, description: 'Log hệ thống được tạo thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  create(@Body() createSystemLogDto: CreateSystemLogDto) {
    return this.systemLogService.create(createSystemLogDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách log hệ thống với tùy chọn phân trang và tìm kiếm' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách log hệ thống' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Số trang' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số bản ghi mỗi trang' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Từ khóa tìm kiếm trong mô tả' })
  @ApiQuery({ name: 'actionName', required: false, type: String, description: 'Tên hành động' })
  @ApiQuery({ name: 'tableName', required: false, type: String, description: 'Tên bảng dữ liệu' })
  @ApiQuery({ name: 'userId', required: false, type: Number, description: 'ID người dùng' })
  @ApiQuery({ name: 'startDate', required: false, type: Date, description: 'Ngày bắt đầu (yyyy-mm-dd)' })
  @ApiQuery({ name: 'endDate', required: false, type: Date, description: 'Ngày kết thúc (yyyy-mm-dd)' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Sắp xếp theo trường' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Thứ tự sắp xếp' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('actionName') actionName?: string,
    @Query('tableName') tableName?: string,
    @Query('userId') userId?: number,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    if (page || limit || search || actionName || tableName || userId || startDate || endDate || sortBy || sortOrder) {
      return this.systemLogService.findAllWithPagination({
        page: page ? +page : 1,
        limit: limit ? +limit : 10,
        search,
        actionName,
        tableName,
        userId,
        startDate,
        endDate,
        sortBy: sortBy || 'actiondate',
        sortOrder: sortOrder || 'DESC',
      });
    }
    
    return this.systemLogService.findAll();
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Lấy thống kê log hệ thống' })
  @ApiResponse({ status: 200, description: 'Trả về thống kê log hệ thống' })
  getLogStatistics() {
    return this.systemLogService.getLogStatistics();
  }

  @Get('by-user/:userId')
  @ApiOperation({ summary: 'Tìm log theo người dùng' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách log của người dùng' })
  @ApiParam({ name: 'userId', description: 'ID người dùng cần tìm log' })
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.systemLogService.findByUser(userId);
  }

  @Get('by-table/:tableName')
  @ApiOperation({ summary: 'Tìm log theo tên bảng dữ liệu' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách log của bảng dữ liệu' })
  @ApiParam({ name: 'tableName', description: 'Tên bảng dữ liệu cần tìm log' })
  findByTable(@Param('tableName') tableName: string) {
    return this.systemLogService.findByTable(tableName);
  }

  @Get('by-action/:actionName')
  @ApiOperation({ summary: 'Tìm log theo tên hành động' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách log theo hành động' })
  @ApiParam({ name: 'actionName', description: 'Tên hành động cần tìm log' })
  findByAction(@Param('actionName') actionName: string) {
    return this.systemLogService.findByAction(actionName);
  }

  @Get('by-date-range')
  @ApiOperation({ summary: 'Tìm log theo khoảng thời gian' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách log trong khoảng thời gian' })
  @ApiQuery({ name: 'startDate', required: true, type: Date, description: 'Ngày bắt đầu (yyyy-mm-dd)' })
  @ApiQuery({ name: 'endDate', required: true, type: Date, description: 'Ngày kết thúc (yyyy-mm-dd)' })
  findByDateRange(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    return this.systemLogService.findByDateRange(startDate, endDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Tìm log theo ID' })
  @ApiResponse({ status: 200, description: 'Trả về log với ID chỉ định' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy log với ID chỉ định' })
  @ApiParam({ name: 'id', description: 'ID của log cần tìm' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.systemLogService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Cập nhật log' })
  @ApiResponse({ status: 200, description: 'Log được cập nhật thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy log với ID chỉ định' })
  @ApiParam({ name: 'id', description: 'ID của log cần cập nhật' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateSystemLogDto: UpdateSystemLogDto) {
    return this.systemLogService.update(id, updateSystemLogDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa log' })
  @ApiResponse({ status: 200, description: 'Log được xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy log với ID chỉ định' })
  @ApiParam({ name: 'id', description: 'ID của log cần xóa' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.systemLogService.remove(id);
  }
}
