import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Semester } from './entities/semester.entity';
import { SemesterService } from './semester.service';
import { SemesterController } from './semester.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Semester])],
  controllers: [SemesterController],
  providers: [SemesterService],
  exports: [SemesterService], // Export service nếu cần dùng ở module khác (ví dụ RoomRegistrationModule)
})
export class SemesterModule {}