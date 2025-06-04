import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsOrder, Like, In, Between } from 'typeorm';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from './entities/student.entity';

interface PaginationOptions {
  page: number;
  limit: number;
  search?: string;
  gender?: string;
  status?: string;
  class?: string;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
}

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
  ) {}

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    // Tạo đối tượng Student từ DTO
    // Kiểm tra xem createStudentDto.accountid có được cung cấp không
    // Trong luồng register-with-student, nó sẽ được controller cung cấp.
    if (!createStudentDto.accountid) {
      // Điều này không nên xảy ra nếu controller đã cung cấp accountid
      // Có thể throw lỗi hoặc xử lý theo logic nghiệp vụ nếu accountid là bắt buộc
      throw new Error('Account ID is required to create a student in this context.');
    }

    const student = this.studentRepository.create({
      accountid: createStudentDto.accountid, // Sử dụng accountid từ DTO
      fullname: createStudentDto.fullName,
      studentcode: createStudentDto.studentCode,
      class: createStudentDto.class,
      // gender: createStudentDto.gender, // createStudentDto.gender giờ là enum Gender
      gender: createStudentDto.gender.toString(), // Chuyển enum thành string nếu cột DB là varchar
      dateofbirth: createStudentDto.dateOfBirth,
      birthplace: createStudentDto.birthplace,
      address: createStudentDto.address,
      email: createStudentDto.email,
      phonenumber: createStudentDto.phoneNumber,
      idcard: createStudentDto.idCard,
      // status: createStudentDto.status || 'Pending', // createStudentDto.status giờ là string 'pending'
      status: createStudentDto.status || 'pending', // Đảm bảo là chữ thường
    });

    // Lưu và trả về đối tượng Student đã được lưu
    return this.studentRepository.save(student);
  }

  async findAll(): Promise<Student[]> {
    return this.studentRepository.find({
      relations: ['roomregistrations', 'roomregistrations.room'],
    });
  }

  async findAllWithPagination(options: PaginationOptions): Promise<{ data: Student[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, search, gender, status, class: className, sortBy = 'accountid', sortOrder = 'ASC' } = options;
    
    const skip = (page - 1) * limit;
    
    // Xây dựng điều kiện tìm kiếm
    const whereConditions: any = {};
    
    if (search) {
      whereConditions.fullname = ILike(`%${search}%`);
    }
    
    if (gender) {
      whereConditions.gender = gender;
    }
    
    if (status) {
      whereConditions.status = status;
    }
    
    if (className) {
      whereConditions.class = ILike(`%${className}%`);
    }
    
    // Xây dựng điều kiện sắp xếp
    const order: FindOptionsOrder<Student> = {};
    order[sortBy] = sortOrder;

    // Tìm kiếm sinh viên với phân trang
    const [result, total] = await this.studentRepository.findAndCount({
      where: whereConditions,
      relations: ['roomregistrations', 'roomregistrations.room'],
      skip,
      take: limit,
      order,
    });
    
    return {
      data: result,
      total,
      page,
      limit,
    };
  }

  async search(query: string): Promise<Student[]> {
    return this.studentRepository.find({
      where: [
        { fullname: ILike(`%${query}%`) },
        { studentcode: ILike(`%${query}%`) },
        { email: ILike(`%${query}%`) },
        { phonenumber: ILike(`%${query}%`) },
      ],
      relations: ['roomregistrations', 'roomregistrations.room'],
    });
  }

  async findByIds(ids: number[]): Promise<Student[]> {
    return this.studentRepository.find({
      where: { accountid: In(ids) },
      relations: ['roomregistrations', 'roomregistrations.room'],
    });
  }

  async findByClass(className: string): Promise<Student[]> {
    return this.studentRepository.find({
      where: { class: ILike(`%${className}%`) },
      relations: ['roomregistrations', 'roomregistrations.room'],
    });
  }

  async findByGender(gender: string): Promise<Student[]> {
    return this.studentRepository.find({
      where: { gender },
      relations: ['roomregistrations', 'roomregistrations.room'],
    });
  }

  async findByStatus(status: string): Promise<Student[]> {
    return this.studentRepository.find({
      where: { status },
      relations: ['roomregistrations', 'roomregistrations.room'],
    });
  }

  async findOne(id: number): Promise<Student> {
    const student = await this.studentRepository.findOne({ 
      where: { accountid: id },
      relations: ['roomregistrations', 'roomregistrations.room', 'roomregistrations.room.building', 'roomregistrations.room.roomtype'],
    });
    
    if (!student) {
      throw new NotFoundException(`Không tìm thấy sinh viên với ID ${id}`);
    }
    
    return student;
  }

  async findByStudentCode(studentCode: string): Promise<Student | null> {
    return this.studentRepository.findOne({
      where: { studentcode: studentCode },
      relations: [
        'roomregistrations',
        'roomregistrations.room',
        'roomregistrations.room.building',
        'roomregistrations.room.roomtype',
        'roomregistrations.semester', // Thêm cả semester để có thể hiển thị sau này nếu cần
      ],
    });
  }

  async findByEmail(email: string): Promise<Student | null> {
    return this.studentRepository.findOne({
      where: { email },
      relations: ['roomregistrations', 'roomregistrations.room'],
    });
  }

  async findByPhone(phone: string): Promise<Student | null> {
    return this.studentRepository.findOne({
      where: { phonenumber: phone },
      relations: ['roomregistrations', 'roomregistrations.room'],
    });
  }

  async update(id: number, updateStudentDto: UpdateStudentDto): Promise<Student> {
    const student = await this.findOne(id);
    
    // Cập nhật các thuộc tính từ DTO
    if (updateStudentDto.fullName !== undefined) {
      student.fullname = updateStudentDto.fullName;
    }
    
    if (updateStudentDto.studentCode !== undefined) {
      student.studentcode = updateStudentDto.studentCode;
    }
    
    if (updateStudentDto.class !== undefined) {
      student.class = updateStudentDto.class;
    }
    
    if (updateStudentDto.gender !== undefined) {
      student.gender = updateStudentDto.gender;
    }
    
    if (updateStudentDto.dateOfBirth !== undefined) {
      student.dateofbirth = updateStudentDto.dateOfBirth;
    }
    
    if (updateStudentDto.birthplace !== undefined) {
      student.birthplace = updateStudentDto.birthplace;
    }
    
    if (updateStudentDto.address !== undefined) {
      student.address = updateStudentDto.address;
    }
    
    if (updateStudentDto.email !== undefined) {
      student.email = updateStudentDto.email;
    }
    
    if (updateStudentDto.phoneNumber !== undefined) {
      student.phonenumber = updateStudentDto.phoneNumber;
    }
    
    if (updateStudentDto.idCard !== undefined) {
      student.idcard = updateStudentDto.idCard;
    }
    
    if (updateStudentDto.status !== undefined) {
      student.status = updateStudentDto.status;
    }
    
    return this.studentRepository.save(student);
  }

  async updateStatus(id: number, status: string): Promise<Student> {
    const student = await this.findOne(id);
    student.status = status;
    return this.studentRepository.save(student);
  }

  async remove(id: number): Promise<void> {
    const student = await this.findOne(id);
    await this.studentRepository.remove(student);
  }

  async countByStatus(): Promise<{ status: string; count: number }[]> {
    const result = await this.studentRepository
      .createQueryBuilder('student')
      .select('student.status', 'status')
      .addSelect('COUNT(student.accountid)', 'count')
      .groupBy('student.status')
      .getRawMany();
    
    return result;
  }

  async countByGender(): Promise<{ gender: string; count: number }[]> {
    const result = await this.studentRepository
      .createQueryBuilder('student')
      .select('student.gender', 'gender')
      .addSelect('COUNT(student.accountid)', 'count')
      .groupBy('student.gender')
      .getRawMany();
    
    return result;
  }

  async countByClass(): Promise<{ class: string; count: number }[]> {
    const result = await this.studentRepository
      .createQueryBuilder('student')
      .select('student.class', 'class')
      .addSelect('COUNT(student.accountid)', 'count')
      .groupBy('student.class')
      .getRawMany();
    
    return result;
  }

  async getStudentStatistics(): Promise<any> {
    const totalStudents = await this.studentRepository.count();
    const statusStats = await this.countByStatus();
    const genderStats = await this.countByGender();
    const classStats = await this.countByClass();
    
    return {
      totalStudents,
      statusStats,
      genderStats,
      classStats,
    };
  }
}
