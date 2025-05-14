import { PartialType } from '@nestjs/mapped-types';
import { CreateInvoiceDto } from './create-invoice.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsDateString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

enum InvoiceStatus {
  Pending = 'Pending',
  Paid = 'Paid',
  Overdue = 'Overdue',
  Cancelled = 'Cancelled'
}

// Kế thừa từ PartialType(CreateInvoiceDto) để tất cả các thuộc tính từ CreateInvoiceDto trở thành optional
export class UpdateInvoiceDto extends PartialType(CreateInvoiceDto) {
  @ApiProperty({ required: false, description: 'Ngày lập hóa đơn', example: '2023-06-01' })
  @IsOptional()
  @IsDateString({}, { message: 'Ngày lập hóa đơn không hợp lệ' })
  invoiceDate?: string;

  @ApiProperty({ required: false, enum: InvoiceStatus, description: 'Trạng thái hóa đơn', example: 'Paid' })
  @IsOptional()
  @IsEnum(InvoiceStatus, { message: 'Trạng thái hóa đơn không hợp lệ' })
  status?: InvoiceStatus;

  @ApiProperty({ required: false, description: 'ID phòng', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'ID phòng phải là số' })
  roomId?: number;

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
}
