import { PartialType } from '@nestjs/swagger';
import { CreateSystemLogDto } from './create-system-log.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSystemLogDto extends PartialType(CreateSystemLogDto) {
  @ApiProperty({ 
    required: false,
    description: 'Tên hành động (ví dụ: Thêm, Sửa, Xóa)', 
    example: 'Sửa sinh viên' 
  })
  @IsOptional()
  @IsString({ message: 'Tên hành động phải là chuỗi' })
  @MaxLength(50, { message: 'Tên hành động không được vượt quá 50 ký tự' })
  actionname?: string;

  @ApiProperty({ 
    required: false,
    description: 'Tên bảng dữ liệu được tác động', 
    example: 'student' 
  })
  @IsOptional()
  @IsString({ message: 'Tên bảng dữ liệu phải là chuỗi' })
  @MaxLength(50, { message: 'Tên bảng dữ liệu không được vượt quá 50 ký tự' })
  tablename?: string;

  @ApiProperty({ 
    required: false,
    description: 'ID của bản ghi bị tác động', 
    example: 2
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'ID bản ghi phải là số' })
  recordid?: number;

  @ApiProperty({ 
    required: false,
    description: 'Mô tả chi tiết hành động', 
    example: 'Sửa thông tin sinh viên Nguyễn Văn A' 
  })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi' })
  description?: string;

  @ApiProperty({ 
    required: false,
    description: 'ID của người dùng thực hiện hành động', 
    example: 2
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'ID người dùng phải là số' })
  userid?: number;
}
