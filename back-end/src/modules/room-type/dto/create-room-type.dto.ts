import { IsNotEmpty, IsOptional, Length, IsNumber, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

enum Gender {
  Male = 'Male',
  Female = 'Female',
  Mixed = 'Mixed'
}

export class CreateRoomTypeDto {
  @IsNotEmpty({ message: 'Tên loại phòng không được để trống' })
  @Length(1, 30, { message: 'Tên loại phòng phải từ 1 đến 30 ký tự' })
  roomTypeName: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Giá phải là số' })
  @Min(0, { message: 'Giá không được âm' })
  price?: number;

  @IsOptional()
  @Length(0, 255, { message: 'Mô tả không được vượt quá 255 ký tự' })
  description?: string;

  @IsOptional()
  @IsEnum(Gender, { message: 'Giới tính phải là Male, Female hoặc Mixed' })
  gender?: Gender;
}
