import { IsNotEmpty, IsOptional, IsNumber, Length, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAccountDto {
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
  @Length(3, 20, { message: 'Tên đăng nhập phải từ 3 đến 20 ký tự' })
  username: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'ID vai trò phải là số' })
  roleId?: number;
}
