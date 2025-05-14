import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ValidationPipe, UsePipes, HttpCode, HttpStatus, NotFoundException, BadRequestException } from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() createStudentDto: CreateStudentDto) {
    try {
      const student = await this.studentService.create(createStudentDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Sinh viên đã được tạo thành công',
        data: student
      };
    } catch (error) {
      if (error.code === '23505') { // PostgreSQL unique constraint violation code
        if (error.detail.includes('studentcode')) {
          throw new BadRequestException('Mã sinh viên đã tồn tại');
        } else if (error.detail.includes('email')) {
          throw new BadRequestException('Email đã tồn tại');
        } else if (error.detail.includes('phonenumber')) {
          throw new BadRequestException('Số điện thoại đã tồn tại');
        }
      }
      throw error;
    }
  }

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('gender') gender?: string,
    @Query('status') status?: string,
    @Query('class') className?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    if (page || limit || search || gender || status || className || sortBy || sortOrder) {
      return this.studentService.findAllWithPagination({
        page: page ? +page : 1,
        limit: limit ? +limit : 10,
        search,
        gender,
        status,
        class: className,
        sortBy: sortBy || 'accountid',
        sortOrder: sortOrder || 'ASC',
      });
    }
    
    const students = await this.studentService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Danh sách sinh viên',
      data: students
    };
  }

  @Get('search')
  async search(@Query('q') query: string) {
    if (!query) {
      throw new BadRequestException('Từ khóa tìm kiếm không được để trống');
    }
    
    const students = await this.studentService.search(query);
    return {
      statusCode: HttpStatus.OK,
      message: 'Kết quả tìm kiếm',
      data: students
    };
  }

  @Get('statistics')
  async getStatistics() {
    const statistics = await this.studentService.getStudentStatistics();
    return {
      statusCode: HttpStatus.OK,
      message: 'Thống kê sinh viên',
      data: statistics
    };
  }

  @Get('by-status/:status')
  async findByStatus(@Param('status') status: string) {
    const students = await this.studentService.findByStatus(status);
    return {
      statusCode: HttpStatus.OK,
      message: `Danh sách sinh viên có trạng thái ${status}`,
      data: students
    };
  }

  @Get('by-gender/:gender')
  async findByGender(@Param('gender') gender: string) {
    const students = await this.studentService.findByGender(gender);
    return {
      statusCode: HttpStatus.OK,
      message: `Danh sách sinh viên giới tính ${gender}`,
      data: students
    };
  }

  @Get('by-class/:class')
  async findByClass(@Param('class') className: string) {
    const students = await this.studentService.findByClass(className);
    return {
      statusCode: HttpStatus.OK,
      message: `Danh sách sinh viên lớp ${className}`,
      data: students
    };
  }

  @Get('by-student-code/:code')
  async findByStudentCode(@Param('code') code: string) {
    const student = await this.studentService.findByStudentCode(code);
    if (!student) {
      throw new NotFoundException(`Không tìm thấy sinh viên với mã ${code}`);
    }
    
    return {
      statusCode: HttpStatus.OK,
      message: 'Thông tin sinh viên',
      data: student
    };
  }

  @Get('by-email/:email')
  async findByEmail(@Param('email') email: string) {
    const student = await this.studentService.findByEmail(email);
    if (!student) {
      throw new NotFoundException(`Không tìm thấy sinh viên với email ${email}`);
    }
    
    return {
      statusCode: HttpStatus.OK,
      message: 'Thông tin sinh viên',
      data: student
    };
  }

  @Get('count-by-status')
  async countByStatus() {
    const counts = await this.studentService.countByStatus();
    return {
      statusCode: HttpStatus.OK,
      message: 'Thống kê số lượng sinh viên theo trạng thái',
      data: counts
    };
  }

  @Get('count-by-gender')
  async countByGender() {
    const counts = await this.studentService.countByGender();
    return {
      statusCode: HttpStatus.OK,
      message: 'Thống kê số lượng sinh viên theo giới tính',
      data: counts
    };
  }

  @Get('count-by-class')
  async countByClass() {
    const counts = await this.studentService.countByClass();
    return {
      statusCode: HttpStatus.OK,
      message: 'Thống kê số lượng sinh viên theo lớp',
      data: counts
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const student = await this.studentService.findOne(+id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Thông tin sinh viên',
        data: student
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Không tìm thấy sinh viên với ID ${id}`);
    }
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    try {
      const student = await this.studentService.update(+id, updateStudentDto);
      return {
        statusCode: HttpStatus.OK,
        message: 'Cập nhật thông tin sinh viên thành công',
        data: student
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.code === '23505') { // PostgreSQL unique constraint violation code
        if (error.detail.includes('studentcode')) {
          throw new BadRequestException('Mã sinh viên đã tồn tại');
        } else if (error.detail.includes('email')) {
          throw new BadRequestException('Email đã tồn tại');
        } else if (error.detail.includes('phonenumber')) {
          throw new BadRequestException('Số điện thoại đã tồn tại');
        }
      }
      throw error;
    }
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    if (!status) {
      throw new BadRequestException('Trạng thái không được để trống');
    }
    
    try {
      const student = await this.studentService.updateStatus(+id, status);
      return {
        statusCode: HttpStatus.OK,
        message: 'Cập nhật trạng thái sinh viên thành công',
        data: student
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Không tìm thấy sinh viên với ID ${id}`);
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    try {
      await this.studentService.remove(+id);
      return {
        statusCode: HttpStatus.OK,
        message: `Đã xóa sinh viên có ID ${id} thành công`,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Không tìm thấy sinh viên với ID ${id}`);
    }
  }
}
