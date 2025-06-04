import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDateString, MaxLength, Matches } from 'class-validator';

export class CreateSemesterDto {
  @ApiProperty({
    description: 'Tên học kỳ (ví dụ: 2024-2025 hk1)',
    example: '2024-2025 hk1',
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'Tên học kỳ không được để trống' })
  @IsString({ message: 'Tên học kỳ phải là chuỗi' })
  @MaxLength(50, { message: 'Tên học kỳ không được vượt quá 50 ký tự' })
  name: string;

  @ApiProperty({
    description: 'Ngày bắt đầu học kỳ (YYYY-MM-DD)',
    example: '2024-09-05',
  })
  @IsNotEmpty({ message: 'Ngày bắt đầu không được để trống' })
  @IsDateString({}, { message: 'Ngày bắt đầu phải là định dạng YYYY-MM-DD' })
  startdate: string;

  @ApiProperty({
    description: 'Ngày kết thúc học kỳ (YYYY-MM-DD)',
    example: '2025-01-15',
  })
  @IsNotEmpty({ message: 'Ngày kết thúc không được để trống' })
  @IsDateString({}, { message: 'Ngày kết thúc phải là định dạng YYYY-MM-DD' })
  // Thêm validator để đảm bảo enddate >= startdate (sẽ được xử lý ở service hoặc DB check constraint đã đủ)
  enddate: string;
}