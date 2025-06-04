import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Semester } from './entities/semester.entity';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { UpdateSemesterDto } from './dto/update-semester.dto';

@Injectable()
export class SemesterService {
  constructor(
    @InjectRepository(Semester)
    private semesterRepository: Repository<Semester>,
  ) {}

  async create(createSemesterDto: CreateSemesterDto): Promise<Semester> {
    if (new Date(createSemesterDto.enddate) < new Date(createSemesterDto.startdate)) {
      throw new BadRequestException('Ngày kết thúc không được trước ngày bắt đầu.');
    }
    try {
      const newSemester = this.semesterRepository.create(createSemesterDto);
      return await this.semesterRepository.save(newSemester);
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new ConflictException(`Học kỳ với tên "${createSemesterDto.name}" đã tồn tại.`);
      }
      throw new BadRequestException(`Không thể tạo học kỳ: ${error.message}`);
    }
  }

  async findAll(): Promise<Semester[]> {
    return this.semesterRepository.find({ order: { startdate: 'DESC' } });
  }

  async findOne(id: number): Promise<Semester> {
    const semester = await this.semesterRepository.findOneBy({ semesterid: id });
    if (!semester) {
      throw new NotFoundException(`Không tìm thấy học kỳ với ID ${id}.`);
    }
    return semester;
  }

  async update(id: number, updateSemesterDto: UpdateSemesterDto): Promise<Semester> {
    const semester = await this.findOne(id);

    // Kiểm tra ngày nếu cả hai được cung cấp và có thay đổi
    const newStartDate = updateSemesterDto.startdate || semester.startdate;
    const newEndDate = updateSemesterDto.enddate || semester.enddate;

    if (new Date(newEndDate) < new Date(newStartDate)) {
      throw new BadRequestException('Ngày kết thúc không được trước ngày bắt đầu.');
    }
    
    try {
      Object.assign(semester, updateSemesterDto);
      return await this.semesterRepository.save(semester);
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new ConflictException(`Học kỳ với tên "${updateSemesterDto.name}" đã tồn tại.`);
      }
      throw new BadRequestException(`Không thể cập nhật học kỳ: ${error.message}`);
    }
  }

  async remove(id: number): Promise<void> {
    const semester = await this.findOne(id);
    // Kiểm tra xem có đăng ký phòng nào liên quan không trước khi xóa (tùy chọn)
    // Ví dụ: if (semester.roomRegistrations && semester.roomRegistrations.length > 0) {
    //   throw new BadRequestException('Không thể xóa học kỳ vì có đăng ký phòng liên quan.');
    // }
    await this.semesterRepository.remove(semester);
  }

  async findActiveSemester(date: Date = new Date()): Promise<Semester | null> {
    // Tìm học kỳ mà ngày hiện tại nằm trong khoảng startdate và enddate
    // Chuyển đổi date sang chuỗi YYYY-MM-DD để so sánh với kiểu 'date' trong DB
    const currentDateString = date.toISOString().split('T')[0];

    return this.semesterRepository
      .createQueryBuilder('semester')
      .where('semester.startdate <= :currentDateString', { currentDateString })
      .andWhere('semester.enddate >= :currentDateString', { currentDateString })
      .getOne();
  }

   async findLatestSemester(): Promise<Semester | null> {
    return this.semesterRepository.findOne({
      order: { enddate: 'DESC' },
    });
  }
}