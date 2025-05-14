import { IsNotEmpty, IsEmail, Length, IsEnum, IsDateString, IsOptional, Matches } from 'class-validator';

enum Gender {
  Male = 'Male',
  Female = 'Female'
}

enum StudentStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected'
}

export class CreateStudentDto {
  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  @Length(2, 70, { message: 'Họ và tên phải từ 2 đến 70 ký tự' })
  fullName: string;

  @IsNotEmpty({ message: 'Mã sinh viên không được để trống' })
  @Length(2, 10, { message: 'Mã sinh viên phải từ 2 đến 10 ký tự' })
  studentCode: string;

  @IsOptional()
  @Length(1, 30, { message: 'Lớp phải từ 1 đến 30 ký tự' })
  class: string;

  @IsNotEmpty({ message: 'Giới tính không được để trống' })
  @IsEnum(Gender, { message: 'Giới tính chỉ có thể là Nam hoặc Nữ' })
  gender: Gender;

  @IsNotEmpty({ message: 'Ngày sinh không được để trống' })
  @IsDateString({}, { message: 'Ngày sinh không hợp lệ' })
  dateOfBirth: string;

  @IsOptional()
  @Length(1, 100, { message: 'Nơi sinh phải từ 1 đến 100 ký tự' })
  birthplace: string;

  @IsOptional()
  @Length(1, 100, { message: 'Địa chỉ phải từ 1 đến 100 ký tự' })
  address: string;

  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @Length(5, 100, { message: 'Email phải từ 5 đến 100 ký tự' })
  email: string;

  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @Matches(/^\d{10}$/, { message: 'Số điện thoại phải có đúng 10 chữ số' })
  phoneNumber: string;

  @IsNotEmpty({ message: 'CMND/CCCD không được để trống' })
  @Length(9, 20, { message: 'CMND/CCCD phải từ 9 đến 20 ký tự' })
  idCard: string;

  @IsOptional()
  @IsEnum(StudentStatus, { message: 'Trạng thái không hợp lệ' })
  status: StudentStatus = StudentStatus.Pending;
}
