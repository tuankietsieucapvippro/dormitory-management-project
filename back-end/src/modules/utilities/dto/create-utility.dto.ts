import { IsNotEmpty, IsNumber, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUtilityDto {
  @ApiProperty({ description: 'ID phòng', example: 1 })
  @IsNotEmpty({ message: 'ID phòng không được để trống' })
  @Type(() => Number)
  @IsNumber({}, { message: 'ID phòng phải là số' })
  roomId: number;

  @ApiProperty({ description: 'Ngày bắt đầu', example: '2023-06-01' })
  @IsNotEmpty({ message: 'Ngày bắt đầu không được để trống' })
  @IsDateString({}, { message: 'Ngày bắt đầu không hợp lệ' })
  startDate: string;

  @ApiProperty({ description: 'Ngày kết thúc', example: '2023-06-30' })
  @IsNotEmpty({ message: 'Ngày kết thúc không được để trống' })
  @IsDateString({}, { message: 'Ngày kết thúc không hợp lệ' })
  endDate: string;

  @ApiProperty({ description: 'Chỉ số điện cũ', example: 1000 })
  @IsNotEmpty({ message: 'Chỉ số điện cũ không được để trống' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Chỉ số điện cũ phải là số' })
  @Min(0, { message: 'Chỉ số điện cũ không được âm' })
  previousElectricityMeter: number;

  @ApiProperty({ description: 'Chỉ số điện mới', example: 1200 })
  @IsNotEmpty({ message: 'Chỉ số điện mới không được để trống' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Chỉ số điện mới phải là số' })
  @Min(0, { message: 'Chỉ số điện mới không được âm' })
  currentElectricityMeter: number;

  @ApiProperty({ description: 'Chỉ số nước cũ', example: 500 })
  @IsNotEmpty({ message: 'Chỉ số nước cũ không được để trống' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Chỉ số nước cũ phải là số' })
  @Min(0, { message: 'Chỉ số nước cũ không được âm' })
  previousWaterMeter: number;

  @ApiProperty({ description: 'Chỉ số nước mới', example: 550 })
  @IsNotEmpty({ message: 'Chỉ số nước mới không được để trống' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Chỉ số nước mới phải là số' })
  @Min(0, { message: 'Chỉ số nước mới không được âm' })
  currentWaterMeter: number;
}
