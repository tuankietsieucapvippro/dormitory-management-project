import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Check
  } from "typeorm";
  import { Room } from "../../room/entities/room.entity";
  import { Student } from "../../student/entities/student.entity";
  import { ApiProperty } from "@nestjs/swagger";
  
  @Index("roomregistration_pkey", ["roomregistrationid"], { unique: true })
  @Entity("roomregistration", { schema: "public" })
  @Check("checkoutdate >= registerdate")
  export class RoomRegistration {
    @ApiProperty({ description: 'ID của đăng ký phòng', example: 1 })
    @PrimaryGeneratedColumn({ type: "integer", name: "roomregistrationid" })
    roomregistrationid: number;
  
    @ApiProperty({ description: 'Ngày đăng ký phòng', example: '2023-05-01', nullable: true })
    @Column("date", { name: "registerdate", nullable: true })
    registerdate: string | null;
  
    @ApiProperty({ description: 'Ngày trả phòng dự kiến', example: '2023-12-31', nullable: true })
    @Column("date", { name: "checkoutdate", nullable: true })
    checkoutdate: string | null;
    
    @ApiProperty({ description: 'Trạng thái đăng ký phòng', example: 'active' })
    @Column("character varying", { name: "status", length: 20 })
    status: string;
  
    @ApiProperty({ description: 'Thông tin phòng liên kết với đăng ký', type: () => Room })
    @ManyToOne(() => Room, (room) => room.roomregistrations, {
      onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "roomid", referencedColumnName: "roomid" }])
    room: Room;
  
    @ApiProperty({ description: 'Thông tin sinh viên liên kết với đăng ký', type: () => Student })
    @ManyToOne(() => Student, (student) => student.roomregistrations, {
      onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "accountid", referencedColumnName: "accountid" }])
    student: Student;
  }
  