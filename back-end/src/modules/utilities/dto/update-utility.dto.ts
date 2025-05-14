import { PartialType } from '@nestjs/mapped-types';
import { CreateUtilityDto } from './create-utility.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';

// Kế thừa từ PartialType(CreateUtilityDto) để tất cả các thuộc tính từ CreateUtilityDto trở thành optional
export class UpdateUtilityDto extends PartialType(CreateUtilityDto) {
  @ApiProperty({ required: false, description: 'ID phòng', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'ID phòng phải là số' })
  roomId?: number;

  @ApiProperty({ required: false, description: 'Ngày bắt đầu', example: '2023-06-01' })
  @IsOptional()
  @IsDateString({}, { message: 'Ngày bắt đầu không hợp lệ' })
  startDate?: string;

  @ApiProperty({ required: false, description: 'Ngày kết thúc', example: '2023-06-30' })
  @IsOptional()
  @IsDateString({}, { message: 'Ngày kết thúc không hợp lệ' })
  endDate?: string;

  @ApiProperty({ required: false, description: 'Chỉ số điện cũ', example: 1000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Chỉ số điện cũ phải là số' })
  @Min(0, { message: 'Chỉ số điện cũ không được âm' })
  previousElectricityMeter?: number;

  @ApiProperty({ required: false, description: 'Chỉ số điện mới', example: 1200 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Chỉ số điện mới phải là số' })
  @Min(0, { message: 'Chỉ số điện mới không được âm' })
  currentElectricityMeter?: number;

  @ApiProperty({ required: false, description: 'Chỉ số nước cũ', example: 500 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Chỉ số nước cũ phải là số' })
  @Min(0, { message: 'Chỉ số nước cũ không được âm' })
  previousWaterMeter?: number;

  @ApiProperty({ required: false, description: 'Chỉ số nước mới', example: 550 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Chỉ số nước mới phải là số' })
  @Min(0, { message: 'Chỉ số nước mới không được âm' })
  currentWaterMeter?: number;
}
