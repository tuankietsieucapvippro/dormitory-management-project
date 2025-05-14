import { IsNotEmpty, IsNumber, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePriceListDto {
  @ApiProperty({ 
    description: 'Loại chi phí (ví dụ: Điện, Nước, Internet...)', 
    example: 'Điện' 
  })
  @IsNotEmpty({ message: 'Loại chi phí không được để trống' })
  @IsString({ message: 'Loại chi phí phải là chuỗi' })
  @MaxLength(50, { message: 'Loại chi phí không được vượt quá 50 ký tự' })
  costType: string;

  @ApiProperty({ 
    description: 'Giá tiền (đơn vị VND/kWh hoặc VND/m3)', 
    example: 3500 
  })
  @IsNotEmpty({ message: 'Giá tiền không được để trống' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Giá tiền phải là số' })
  @Min(0, { message: 'Giá tiền không được âm' })
  price: number;
}
