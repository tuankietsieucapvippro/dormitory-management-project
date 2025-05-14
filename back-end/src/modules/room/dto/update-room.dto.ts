import { PartialType } from '@nestjs/mapped-types';
import { CreateRoomDto } from './create-room.dto';

// Kế thừa từ PartialType(CreateRoomDto) để tất cả các thuộc tính từ CreateRoomDto trở thành optional
export class UpdateRoomDto extends PartialType(CreateRoomDto) {}
