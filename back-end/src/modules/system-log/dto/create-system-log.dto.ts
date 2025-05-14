import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSystemLogDto {
  @ApiProperty({ 
    description: 'Tên hành động (ví dụ: Thêm, Sửa, Xóa)', 
    example: 'Thêm sinh viên' 
  })
  @IsNotEmpty({ message: 'Tên hành động không được để trống' })
  @IsString({ message: 'Tên hành động phải là chuỗi' })
  @MaxLength(50, { message: 'Tên hành động không được vượt quá 50 ký tự' })
  actionname: string;

  @ApiProperty({ 
    description: 'Tên bảng dữ liệu được tác động', 
    example: 'student' 
  })
  @IsNotEmpty({ message: 'Tên bảng dữ liệu không được để trống' })
  @IsString({ message: 'Tên bảng dữ liệu phải là chuỗi' })
  @MaxLength(50, { message: 'Tên bảng dữ liệu không được vượt quá 50 ký tự' })
  tablename: string;

  @ApiProperty({ 
    description: 'ID của bản ghi bị tác động', 
    example: 1 
  })
  @IsNotEmpty({ message: 'ID bản ghi không được để trống' })
  @Type(() => Number)
  @IsNumber({}, { message: 'ID bản ghi phải là số' })
  recordid: number;

  @ApiProperty({ 
    description: 'Mô tả chi tiết hành động', 
    example: 'Thêm sinh viên Nguyễn Văn A vào hệ thống', 
    required: false 
  })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi' })
  description?: string;

  @ApiProperty({ 
    description: 'ID của người dùng thực hiện hành động', 
    example: 1
  })
  @IsNotEmpty({ message: 'ID người dùng không được để trống' })
  @Type(() => Number)
  @IsNumber({}, { message: 'ID người dùng phải là số' })
  userid: number;
}
