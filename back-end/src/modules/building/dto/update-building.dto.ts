import { PartialType } from '@nestjs/mapped-types';
import { CreateBuildingDto } from './create-building.dto';

// Kế thừa từ PartialType(CreateBuildingDto) để tất cả các thuộc tính từ CreateBuildingDto trở thành optional
export class UpdateBuildingDto extends PartialType(CreateBuildingDto) {}
