import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateRoomRegistrationDto, RegistrationStatus } from './dto/create-room-registration.dto';
import { UpdateRoomRegistrationDto } from './dto/update-room-registration.dto';
import { RoomRegistration } from './entities/room-registration.entity';

@Injectable()
export class RoomRegistrationService {
  constructor(
    @InjectRepository(RoomRegistration)
    private roomRegistrationRepository: Repository<RoomRegistration>,
  ) {}

  async create(createRoomRegistrationDto: CreateRoomRegistrationDto): Promise<RoomRegistration> {
    try {
      // Kiểm tra xem sinh viên đã có đăng ký nào đang hoạt động (pending hoặc approved) chưa
      // Kiểm tra xem sinh viên đã có đăng ký nào đang hoạt động (pending hoặc approved) cho học kỳ này chưa
      const existingRegistration = await this.roomRegistrationRepository.findOne({
        where: {
          student: { accountid: createRoomRegistrationDto.studentId },
          semester: { semesterid: createRoomRegistrationDto.semesterId },
          status: In([RegistrationStatus.Pending, RegistrationStatus.Approved]),
        },
      });

      if (existingRegistration) {
        throw new ConflictException(
          `Sinh viên với ID ${createRoomRegistrationDto.studentId} đã có một đăng ký phòng cho học kỳ ID ${createRoomRegistrationDto.semesterId} đang chờ xử lý hoặc đã được duyệt.`,
        );
      }

      // Tạo đối tượng RoomRegistration từ DTO
      const roomRegistration = this.roomRegistrationRepository.create({
        // registerdate và checkoutdate đã bị xóa
        status: RegistrationStatus.Approved, // Luôn đặt là Approved
        student: { accountid: createRoomRegistrationDto.studentId } as any,
        room: { roomid: createRoomRegistrationDto.roomId } as any,
        semester: { semesterid: createRoomRegistrationDto.semesterId } as any,
      });

      // Lưu và trả về đối tượng đã được lưu
      return this.roomRegistrationRepository.save(roomRegistration);
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Không thể tạo đăng ký phòng: ${error.message}`);
    }
  }

  async findAll(): Promise<RoomRegistration[]> {
    try {
      return this.roomRegistrationRepository.find({
        relations: ['student', 'room', 'room.building', 'room.roomtype', 'semester'], // Thêm semester
      });
    } catch (error) {
      throw new BadRequestException(`Không thể lấy danh sách đăng ký phòng: ${error.message}`);
    }
  }

  async findOne(id: number): Promise<RoomRegistration> {
    try {
      const registration = await this.roomRegistrationRepository.findOne({
        where: { roomregistrationid: id },
        relations: ['student', 'room', 'room.building', 'room.roomtype', 'semester'], // Thêm semester
      });

      if (!registration) {
        throw new NotFoundException(`Không tìm thấy đăng ký phòng có ID ${id}`);
      }

      return registration;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Không thể lấy thông tin đăng ký phòng: ${error.message}`);
    }
  }

  async update(id: number, updateRoomRegistrationDto: UpdateRoomRegistrationDto): Promise<RoomRegistration> {
    try {
      const registration = await this.findOne(id); // registration.student.accountid is the original studentId

      const newStudentId = updateRoomRegistrationDto.studentId;
      const newStatus = updateRoomRegistrationDto.status;
      const newSemesterId = updateRoomRegistrationDto.semesterId;

      // Determine the final studentId, status, and semesterId that will be checked
      const finalStudentId = newStudentId || registration.student.accountid;
      const finalStatus = newStatus || registration.status;
      // registration.semester có thể undefined nếu relation không được load, cần kiểm tra
      const finalSemesterId = newSemesterId || (registration.semester ? registration.semester.semesterid : undefined);

      if (!finalSemesterId) {
          throw new BadRequestException('Semester ID là bắt buộc để kiểm tra xung đột.');
      }

      // Check for conflict if the final state is 'pending' or 'approved'
      if ([RegistrationStatus.Pending, RegistrationStatus.Approved].includes(finalStatus as RegistrationStatus)) {
        const conflictingRegistration = await this.roomRegistrationRepository.findOne({
          where: {
            student: { accountid: finalStudentId },
            semester: { semesterid: finalSemesterId },
            status: In([RegistrationStatus.Pending, RegistrationStatus.Approved]),
          },
        });

        // If a conflicting registration exists AND it's not the one we are currently updating
        if (conflictingRegistration && conflictingRegistration.roomregistrationid !== id) {
          throw new ConflictException(
            `Sinh viên với ID ${finalStudentId} đã có một đăng ký phòng cho học kỳ ID ${finalSemesterId} đang chờ xử lý hoặc đã được duyệt.`,
          );
        }
      }

      // Apply updates
      // Xóa logic cập nhật cho registerdate và checkoutdate
      // if (updateRoomRegistrationDto.registerDate) {
      //   registration.registerdate = updateRoomRegistrationDto.registerDate;
      // }
      // if (updateRoomRegistrationDto.checkoutDate) {
      //   registration.checkoutdate = updateRoomRegistrationDto.checkoutDate;
      // }
      if (updateRoomRegistrationDto.roomId) {
        registration.room = { roomid: updateRoomRegistrationDto.roomId } as any;
      }
      if (newStudentId) {
        registration.student = { accountid: newStudentId } as any;
      }
      if (newStatus) {
        registration.status = newStatus;
      }
      if (newSemesterId) {
        registration.semester = { semesterid: newSemesterId } as any; // Cập nhật semester
      }
      
      return this.roomRegistrationRepository.save(registration);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Không thể cập nhật đăng ký phòng: ${error.message}`);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const registration = await this.findOne(id);
      await this.roomRegistrationRepository.remove(registration);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Không thể xóa đăng ký phòng: ${error.message}`);
    }
  }
}
