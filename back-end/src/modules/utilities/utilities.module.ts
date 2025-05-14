import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilitiesService } from './utilities.service';
import { UtilitiesController } from './utilities.controller';
import { Utilities } from './entities/utility.entity';
import { Room } from '../room/entities/room.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Utilities, Room])
  ],
  controllers: [UtilitiesController],
  providers: [UtilitiesService],
})
export class UtilitiesModule {}
