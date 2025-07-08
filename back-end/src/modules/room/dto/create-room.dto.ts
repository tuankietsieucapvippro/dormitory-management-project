import { IsNotEmpty, IsOptional, IsNumber, Length, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

enum RoomStatus {
  Available = 'available',
  Occupied = 'occupied',
  Maintenance = 'maintenance'
}

export class CreateRoomDto {
  @IsNotEmpty({ message: 'Tên phòng không được để trống' })
  @Length(1, 30, { message: 'Tên phòng phải từ 1 đến 30 ký tự' })
  roomName: string;

  @IsNotEmpty({ message: 'ID tòa nhà không được để trống' })
  @Type(() => Number)
  @IsNumber({}, { message: 'ID tòa nhà phải là số' })
  buildingId: number;

  @IsOptional()
  @IsEnum(RoomStatus, { message: 'Trạng thái phòng không hợp lệ' })
  status?: RoomStatus;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Số giường phải là số' })
  @Min(1, { message: 'Số giường phải lớn hơn 0' })
  @Max(10, { message: 'Số giường không được vượt quá 10' })
  bedCount?: number;

  @IsNotEmpty({ message: 'ID loại phòng không được để trống' })
  @Type(() => Number)
  @IsNumber({}, { message: 'ID loại phòng phải là số' })
  roomTypeId: number;
}
