import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException } from '@nestjs/common';
import { RoomRegistrationService } from './room-registration.service';
import { CreateRoomRegistrationDto } from './dto/create-room-registration.dto';
import { UpdateRoomRegistrationDto } from './dto/update-room-registration.dto';
import { StudentService } from '../student/student.service';
import { CreateStudentDto } from '../student/dto/create-student.dto';

@Controller('room-registration')
export class RoomRegistrationController {
  constructor(
    private readonly roomRegistrationService: RoomRegistrationService,
    private readonly studentService: StudentService,
  ) {}

  @Post()
  create(@Body() createRoomRegistrationDto: CreateRoomRegistrationDto) {
    return this.roomRegistrationService.create(createRoomRegistrationDto);
  }

  @Post('register-with-student')
  async registerWithStudent(
    @Body() registrationData: { student: CreateStudentDto; registration: Omit<CreateRoomRegistrationDto, 'studentId'> }
  ) {
    try {
      // 1. Tạo sinh viên
      const student = await this.studentService.create(registrationData.student);
      
      // 2. Sử dụng ID sinh viên từ đối tượng đã tạo
      const studentId = student.accountid;
      
      // 3. Tạo đối tượng đăng ký phòng với ID sinh viên
      const registrationDto: CreateRoomRegistrationDto = {
        ...registrationData.registration as any,
        studentId
      };

      // 4. Tạo đăng ký phòng
      return this.roomRegistrationService.create(registrationDto);
    } catch (error) {
      throw new BadRequestException('Lỗi khi đăng ký: ' + error.message);
    }
  }

  @Get()
  findAll() {
    return this.roomRegistrationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomRegistrationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoomRegistrationDto: UpdateRoomRegistrationDto) {
    return this.roomRegistrationService.update(+id, updateRoomRegistrationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomRegistrationService.remove(+id);
  }
}
