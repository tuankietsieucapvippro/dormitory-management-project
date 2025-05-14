import { PartialType } from '@nestjs/mapped-types';
import { CreateRoomRegistrationDto, RegistrationStatus } from './create-room-registration.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

// Kế thừa từ PartialType(CreateRoomRegistrationDto) để tất cả các thuộc tính từ CreateRoomRegistrationDto trở thành optional
export class UpdateRoomRegistrationDto extends PartialType(CreateRoomRegistrationDto) {
  @ApiProperty({ 
    description: 'Trạng thái đăng ký phòng', 
    enum: RegistrationStatus,
    example: 'Active',
    required: false
  })
  @IsOptional()
  @IsEnum(RegistrationStatus, { message: 'Trạng thái không hợp lệ' })
  status?: RegistrationStatus;
}
