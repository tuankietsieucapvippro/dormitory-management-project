import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { SemesterService } from './semester.service';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { UpdateSemesterDto } from './dto/update-semester.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { Semester } from './entities/semester.entity';

@ApiTags('Semesters')
@Controller('semesters')
export class SemesterController {
  constructor(private readonly semesterService: SemesterService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo một học kỳ mới' })
  @ApiBody({ type: CreateSemesterDto })
  @ApiResponse({ status: 201, description: 'Học kỳ đã được tạo thành công.', type: Semester })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  @ApiResponse({ status: 409, description: 'Tên học kỳ đã tồn tại.' })
  async create(@Body() createSemesterDto: CreateSemesterDto): Promise<Semester> {
    return this.semesterService.create(createSemesterDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả học kỳ' })
  @ApiResponse({ status: 200, description: 'Danh sách các học kỳ.', type: [Semester] })
  async findAll(): Promise<Semester[]> {
    return this.semesterService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Lấy học kỳ đang hoạt động hiện tại' })
  @ApiResponse({ status: 200, description: 'Học kỳ đang hoạt động. Có thể trả về null nếu không có học kỳ nào đang hoạt động.', type: Semester })
  async findActiveSemester(): Promise<Semester | null> {
    return this.semesterService.findActiveSemester();
  }

  @Get('latest')
  @ApiOperation({ summary: 'Lấy học kỳ gần nhất (theo ngày kết thúc)' })
  @ApiResponse({ status: 200, description: 'Học kỳ gần nhất. Có thể trả về null nếu không có học kỳ nào.', type: Semester })
  async findLatestSemester(): Promise<Semester | null> {
    return this.semesterService.findLatestSemester();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin một học kỳ theo ID' })
  @ApiParam({ name: 'id', description: 'ID của học kỳ', type: Number })
  @ApiResponse({ status: 200, description: 'Thông tin chi tiết học kỳ.', type: Semester })
  @ApiResponse({ status: 404, description: 'Không tìm thấy học kỳ.' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Semester> {
    return this.semesterService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin một học kỳ' })
  @ApiParam({ name: 'id', description: 'ID của học kỳ cần cập nhật', type: Number })
  @ApiBody({ type: UpdateSemesterDto })
  @ApiResponse({ status: 200, description: 'Học kỳ đã được cập nhật thành công.', type: Semester })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy học kỳ.' })
  @ApiResponse({ status: 409, description: 'Tên học kỳ đã tồn tại (nếu thay đổi tên).' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateSemesterDto: UpdateSemesterDto): Promise<Semester> {
    return this.semesterService.update(id, updateSemesterDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa một học kỳ' })
  @ApiParam({ name: 'id', description: 'ID của học kỳ cần xóa', type: Number })
  @ApiResponse({ status: 204, description: 'Học kỳ đã được xóa thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy học kỳ.' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.semesterService.remove(id);
  }
}