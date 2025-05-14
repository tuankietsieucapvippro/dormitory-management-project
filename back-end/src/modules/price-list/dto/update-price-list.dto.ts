import { PartialType } from '@nestjs/mapped-types';
import { CreatePriceListDto } from './create-price-list.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePriceListDto extends PartialType(CreatePriceListDto) {
  @ApiProperty({ 
    required: false,
    description: 'Loại chi phí (ví dụ: Điện, Nước, Internet...)', 
    example: 'Điện' 
  })
  @IsOptional()
  @IsString({ message: 'Loại chi phí phải là chuỗi' })
  @MaxLength(50, { message: 'Loại chi phí không được vượt quá 50 ký tự' })
  costType?: string;

  @ApiProperty({ 
    required: false,
    description: 'Giá tiền (đơn vị VND/kWh hoặc VND/m3)', 
    example: 3500 
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Giá tiền phải là số' })
  @Min(0, { message: 'Giá tiền không được âm' })
  price?: number;
}
