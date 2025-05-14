import { Module } from '@nestjs/common';
import { RoomRegistrationService } from './room-registration.service';
import { RoomRegistrationController } from './room-registration.controller';
import { RoomRegistration } from './entities/room-registration.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentModule } from '../student/student.module';

@Module({
  imports: [TypeOrmModule.forFeature([RoomRegistration]),
    StudentModule,
  ],
  controllers: [RoomRegistrationController],
  providers: [RoomRegistrationService],
})
export class RoomRegistrationModule {}
