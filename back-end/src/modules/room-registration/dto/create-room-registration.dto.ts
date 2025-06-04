import { IsNotEmpty, IsOptional, IsNumber, IsDateString, IsEnum, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum RegistrationStatus {
  Pending = 'pending',    // Thay đổi thành chữ thường
  Approved = 'approved',  // Thay đổi thành chữ thường
  Rejected = 'rejected',  // Giữ nguyên hoặc thêm nếu cần
  CheckedOut = 'checkedout' // Thêm/thay thế cho Active/Inactive để khớp với DB constraint
}

export class CreateRoomRegistrationDto {
  @ApiProperty({ description: 'ID của sinh viên', example: 1 })
  @IsNotEmpty({ message: 'ID sinh viên không được để trống' })
  @Type(() => Number)
  @IsNumber({}, { message: 'ID sinh viên phải là số' })
  studentId: number;

  @ApiProperty({ description: 'ID của phòng', example: 1 })
  @IsNotEmpty({ message: 'ID phòng không được để trống' })
  @Type(() => Number)
  @IsNumber({}, { message: 'ID phòng phải là số' })
  roomId: number;

  @ApiProperty({ description: 'ID của học kỳ', example: 1 })
  @IsNotEmpty({ message: 'ID học kỳ không được để trống' })
  @Type(() => Number)
  @IsNumber({}, { message: 'ID học kỳ phải là số' })
  semesterId: number;

  // Xóa registerDate và checkoutDate
  // @ApiProperty({ description: 'Ngày đăng ký phòng', example: '2023-05-01', required: false })
  // @IsOptional()
  // @IsDateString({}, { message: 'Ngày đăng ký không hợp lệ' })
  // registerDate?: string;

  // @ApiProperty({ description: 'Ngày trả phòng dự kiến', example: '2023-12-31', required: false })
  // @IsOptional()
  // @IsDateString({}, { message: 'Ngày trả phòng không hợp lệ' })
  // checkoutDate?: string;

  @ApiProperty({ description: 'ID của tòa nhà', example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'ID tòa nhà phải là số' })
  buildingId?: number;

  @ApiProperty({ description: 'ID của loại phòng', example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'ID loại phòng phải là số' })
  roomTypeId?: number;

  @ApiProperty({ 
    description: 'Trạng thái đăng ký phòng', 
    enum: RegistrationStatus,
    default: RegistrationStatus.Pending, // Thay đổi default
    example: RegistrationStatus.Pending, // Thay đổi example
    required: false 
  })
  @IsOptional()
  @IsEnum(RegistrationStatus, { message: 'Trạng thái không hợp lệ' })
  status?: RegistrationStatus = RegistrationStatus.Pending; // Thay đổi default
}
