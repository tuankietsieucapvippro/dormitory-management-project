import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
  username: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  password: string;
} 