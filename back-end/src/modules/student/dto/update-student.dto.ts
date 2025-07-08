import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateStudentDto } from './create-student.dto';

// Loại bỏ accountid khỏi UpdateStudentDto vì nó không được phép cập nhật
// và tạo tất cả các thuộc tính còn lại thành optional
export class UpdateStudentDto extends PartialType(
  OmitType(CreateStudentDto, ['accountid'] as const)
) {}
