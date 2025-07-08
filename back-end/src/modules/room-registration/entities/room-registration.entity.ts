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
  import { Semester } from "../../semester/entities/semester.entity"; // Import Semester
  import { ApiProperty } from "@nestjs/swagger";
  
  @Index("roomregistration_pkey", ["roomregistrationid"], { unique: true })
  // Index cho accountid và semesterid với điều kiện status
  @Index("unique_registration_per_semester", ["student", "semester"], {
    where: "status IN ('pending', 'approved')",
    unique: true,
  })
  // Index cho accountid với điều kiện status
  @Index("unique_active_registration_per_account", ["student"], {
    where: "status IN ('pending', 'approved')",
    unique: true,
  })
  @Entity("roomregistration", { schema: "public" })
  // @Check("checkoutdate >= registerdate") // Xóa check constraint này
  @Check("status IN ('pending', 'approved', 'checkedout')")
  export class RoomRegistration {
    @ApiProperty({ description: 'ID của đăng ký phòng', example: 1 })
    @PrimaryGeneratedColumn({ type: "integer", name: "roomregistrationid" })
    roomregistrationid: number;
  
    // Xóa registerdate và checkoutdate
    // @ApiProperty({ description: 'Ngày đăng ký phòng', example: '2023-05-01', nullable: true })
    // @Column("date", { name: "registerdate", nullable: true })
    // registerdate: string | null;
  
    // @ApiProperty({ description: 'Ngày trả phòng dự kiến', example: '2023-12-31', nullable: true })
    // @Column("date", { name: "checkoutdate", nullable: true })
    // checkoutdate: string | null;
    
    @Column("integer", { name: "accountid" })
    accountid: number;

    @Column("integer", { name: "roomid" })
    roomid: number;

    @ApiProperty({ description: 'Trạng thái đăng ký phòng', example: 'pending' }) // Cập nhật ví dụ
    @Column("character varying", { name: "status", length: 20 })
    status: string;

    @Column("integer", { name: "semesterid", nullable: true })
    semesterid: number | null;

    @ApiProperty({ description: 'Thông tin phòng liên kết với đăng ký', type: () => Room })
    @ManyToOne(() => Room, (room) => room.roomregistrations, {
      onDelete: "CASCADE",
      nullable: false, // Đảm bảo khóa ngoại không null
    })
    @JoinColumn([{ name: "roomid", referencedColumnName: "roomid" }])
    room: Room;

    @ApiProperty({ description: 'Thông tin sinh viên liên kết với đăng ký', type: () => Student })
    @ManyToOne(() => Student, (student) => student.roomregistrations, {
      onDelete: "CASCADE",
      nullable: false, // Đảm bảo khóa ngoại không null
    })
    @JoinColumn([{ name: "accountid", referencedColumnName: "accountid" }])
    student: Student;

    @ApiProperty({ description: 'Thông tin học kỳ liên kết với đăng ký', type: () => Semester })
    @ManyToOne(() => Semester, (semester) => semester.roomRegistrations, {
      onDelete: "CASCADE", // Hoặc "SET NULL" hoặc "RESTRICT" tùy theo logic nghiệp vụ
      nullable: false, // Giả sử một đăng ký luôn phải thuộc về một học kỳ
    })
    @JoinColumn([{ name: "semesterid", referencedColumnName: "semesterid" }])
    semester: Semester;
  }
  