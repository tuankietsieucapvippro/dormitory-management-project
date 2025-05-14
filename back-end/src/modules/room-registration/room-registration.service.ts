import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
      // Tạo đối tượng RoomRegistration từ DTO
      const roomRegistration = this.roomRegistrationRepository.create({
        registerdate: createRoomRegistrationDto.registerDate || new Date().toISOString().slice(0, 10),
        checkoutdate: createRoomRegistrationDto.checkoutDate,
        status: createRoomRegistrationDto.status || RegistrationStatus.Active,
        student: { accountid: createRoomRegistrationDto.studentId } as any,
        room: { roomid: createRoomRegistrationDto.roomId } as any,
      });

      // Lưu và trả về đối tượng đã được lưu
      return this.roomRegistrationRepository.save(roomRegistration);
    } catch (error) {
      throw new BadRequestException(`Không thể tạo đăng ký phòng: ${error.message}`);
    }
  }

  async findAll(): Promise<RoomRegistration[]> {
    try {
      return this.roomRegistrationRepository.find({
        relations: ['student', 'room', 'room.building', 'room.roomtype'],
      });
    } catch (error) {
      throw new BadRequestException(`Không thể lấy danh sách đăng ký phòng: ${error.message}`);
    }
  }

  async findOne(id: number): Promise<RoomRegistration> {
    try {
      const registration = await this.roomRegistrationRepository.findOne({
        where: { roomregistrationid: id },
        relations: ['student', 'room', 'room.building', 'room.roomtype'],
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
      const registration = await this.findOne(id);

      // Cập nhật thông tin từ DTO
      if (updateRoomRegistrationDto.registerDate) {
        registration.registerdate = updateRoomRegistrationDto.registerDate;
      }
      
      if (updateRoomRegistrationDto.checkoutDate) {
        registration.checkoutdate = updateRoomRegistrationDto.checkoutDate;
      }
      
      if (updateRoomRegistrationDto.roomId) {
        registration.room = { roomid: updateRoomRegistrationDto.roomId } as any;
      }
      
      if (updateRoomRegistrationDto.studentId) {
        registration.student = { accountid: updateRoomRegistrationDto.studentId } as any;
      }
      
      if (updateRoomRegistrationDto.status) {
        registration.status = updateRoomRegistrationDto.status;
      }
      
      return this.roomRegistrationRepository.save(registration);
    } catch (error) {
      if (error instanceof NotFoundException) {
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
