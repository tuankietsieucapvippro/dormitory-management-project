import { ApiProperty } from '@nestjs/swagger';
import { RoomRegistration } from '../../room-registration/entities/room-registration.entity';
import { Entity, PrimaryGeneratedColumn, Column, Check, OneToMany, Index } from 'typeorm';

@Entity('semester', { schema: 'public' })
@Check(`"enddate" >= "startdate"`)
export class Semester {
  @ApiProperty({ description: 'ID của học kỳ', example: 1 })
  @PrimaryGeneratedColumn({ type: 'integer', name: 'semesterid' })
  semesterid: number;

  @ApiProperty({ description: 'Tên học kỳ', example: '2024-2025 hk1' })
  @Column('character varying', { name: 'name', length: 50, unique: true })
  @Index({ unique: true }) // Đảm bảo unique constraint được TypeORM nhận diện
  name: string;

  @ApiProperty({ description: 'Ngày bắt đầu học kỳ', example: '2024-09-05' })
  @Column('date', { name: 'startdate' })
  startdate: string;

  @ApiProperty({ description: 'Ngày kết thúc học kỳ', example: '2025-01-15' })
  @Column('date', { name: 'enddate' })
  enddate: string;

  @OneToMany(() => RoomRegistration, (roomRegistration) => roomRegistration.semester)
  roomRegistrations: RoomRegistration[];
}