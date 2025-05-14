import { IsNotEmpty, IsOptional, Length } from 'class-validator';

export class CreateBuildingDto {
  @IsNotEmpty({ message: 'Tên tòa nhà không được để trống' })
  @Length(1, 30, { message: 'Tên tòa nhà phải từ 1 đến 30 ký tự' })
  buildingName: string;

  @IsOptional()
  @Length(0, 255, { message: 'Mô tả không được vượt quá 255 ký tự' })
  description?: string;
}
