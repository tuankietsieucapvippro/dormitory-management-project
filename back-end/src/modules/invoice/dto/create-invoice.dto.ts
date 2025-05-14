import { IsNotEmpty, IsOptional, IsNumber, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

enum InvoiceStatus {
  Pending = 'Pending',
  Paid = 'Paid',
  Overdue = 'Overdue',
  Cancelled = 'Cancelled'
}

export class CreateInvoiceDto {
  @ApiProperty({ description: 'Ngày lập hóa đơn', example: '2023-06-01' })
  @IsNotEmpty({ message: 'Ngày lập hóa đơn không được để trống' })
  @IsDateString({}, { message: 'Ngày lập hóa đơn không hợp lệ' })
  invoiceDate: string;

  @ApiProperty({ enum: InvoiceStatus, description: 'Trạng thái hóa đơn', example: 'Pending' })
  @IsNotEmpty({ message: 'Trạng thái hóa đơn không được để trống' })
  @IsEnum(InvoiceStatus, { message: 'Trạng thái hóa đơn không hợp lệ' })
  status: InvoiceStatus;

  @ApiProperty({ description: 'ID phòng', example: 1 })
  @IsNotEmpty({ message: 'ID phòng không được để trống' })
  @Type(() => Number)
  @IsNumber({}, { message: 'ID phòng phải là số' })
  roomId: number;

  @ApiProperty({ required: false, description: 'ID tiện ích', example: 1, nullable: true })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'ID tiện ích phải là số' })
  utilitiesId?: number | null;

  @ApiProperty({ required: false, description: 'ID giá điện', example: 1, nullable: true })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'ID giá điện phải là số' })
  electricityPriceId?: number | null;

  @ApiProperty({ required: false, description: 'ID giá nước', example: 1, nullable: true })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'ID giá nước phải là số' })
  waterPriceId?: number | null;

  @ApiProperty({ required: false, description: 'Tổng tiền', example: 1500000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Tổng tiền phải là số' })
  totalAmount?: number;
}
