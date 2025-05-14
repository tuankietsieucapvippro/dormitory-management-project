import { PartialType } from '@nestjs/mapped-types';
import { CreateRoomTypeDto } from './create-room-type.dto';

// Kế thừa từ PartialType(CreateRoomTypeDto) để tất cả các thuộc tính từ CreateRoomTypeDto trở thành optional
export class UpdateRoomTypeDto extends PartialType(CreateRoomTypeDto) {}
