import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Tên vai trò trong hệ thống',
    example: 'Admin',
    minLength: 2,
    maxLength: 50
  })
  @IsNotEmpty({ message: 'Tên vai trò không được để trống' })
  @IsString({ message: 'Tên vai trò phải là chuỗi' })
  @Length(2, 50, { message: 'Tên vai trò phải có độ dài từ 2 đến 50 ký tự' })
  @Matches(/^[a-zA-Z0-9\s\-_]+$/, { 
    message: 'Tên vai trò chỉ được chứa chữ cái, số, dấu gạch ngang và gạch dưới' 
  })
  roleName: string;
}
