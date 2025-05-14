import { PartialType } from '@nestjs/mapped-types';
import { CreateStudentDto } from './create-student.dto';

// Bằng cách kế thừa từ PartialType(CreateStudentDto), UpdateStudentDto sẽ có tất cả
// các thuộc tính của CreateStudentDto nhưng tất cả đều là optional
export class UpdateStudentDto extends PartialType(CreateStudentDto) {}
