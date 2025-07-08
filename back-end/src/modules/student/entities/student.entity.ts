import {
    Column,
    Entity,
    Index,
    OneToMany,
    OneToOne, // Thay ManyToOne bằng OneToOne
    JoinColumn,
    Check,
    PrimaryColumn // Sử dụng PrimaryColumn
  } from "typeorm";
  import { RoomRegistration } from "../../room-registration/entities/room-registration.entity";
  import { Account } from "../../account/entities/account.entity";
  import { ApiProperty } from "@nestjs/swagger"; // Import ApiProperty
  
  @Index("student_email_key", ["email"], { unique: true })
  @Index("student_phonenumber_key", ["phonenumber"], { unique: true })
  @Index("student_studentcode_key", ["studentcode"], { unique: true })
  // @Index("student_pkey", ["accountid"], { unique: true }) // PrimaryColumn đã bao hàm unique
  @Entity("student", { schema: "public" })
  @Check("gender IN ('Male', 'Female')")
  @Check("status IN ('pending', 'approved', 'rejected')")
  @Check("dateofbirth <= CURRENT_DATE")
  export class Student {
    @ApiProperty({ description: 'ID tài khoản của sinh viên (Khóa chính & Khóa ngoại)', example: 1 })
    @PrimaryColumn({ type: "integer", name: "accountid" }) // Đây là khóa chính và cũng là khóa ngoại
    accountid: number;
  
    @ApiProperty({ description: 'Họ và tên đầy đủ', example: 'Nguyễn Văn A' })
    @Column("character varying", { name: "fullname", length: 70 })
    fullname: string;
  
    @ApiProperty({ description: 'Mã sinh viên', example: 'SV001' })
    @Column("character varying", {
      name: "studentcode",
      unique: true,
      length: 10,
    })
    studentcode: string;
  
    @ApiProperty({ description: 'Lớp', example: 'CNTT01', nullable: true })
    @Column("character varying", { name: "class", nullable: true, length: 30 })
    class: string | null;
  
    @ApiProperty({ description: 'Giới tính', example: 'Male', enum: ['Male', 'Female'], nullable: true })
    @Column("character varying", { name: "gender", nullable: true, length: 10 })
    gender: string | null;
  
    @ApiProperty({ description: 'Ngày sinh (YYYY-MM-DD)', example: '2002-10-15', nullable: true })
    @Column("date", { name: "dateofbirth", nullable: true })
    dateofbirth: string | null;
  
    @ApiProperty({ description: 'Nơi sinh', example: 'Hà Nội', nullable: true })
    @Column("character varying", {
      name: "birthplace",
      nullable: true,
      length: 100,
    })
    birthplace: string | null;
  
    @ApiProperty({ description: 'Địa chỉ thường trú', example: '123 Đường ABC, Quận XYZ', nullable: true })
    @Column("character varying", { name: "address", nullable: true, length: 100 })
    address: string | null;
  
    @ApiProperty({ description: 'Địa chỉ email (duy nhất)', example: 'sv.nguyenvana@example.com', nullable: true })
    @Column("character varying", {
      name: "email",
      nullable: true,
      unique: true,
      length: 100,
    })
    email: string | null;
  
    @ApiProperty({ description: 'Số điện thoại (duy nhất)', example: '0912345678', nullable: true })
    @Column("character varying", {
      name: "phonenumber",
      nullable: true,
      unique: true,
      length: 10,
    })
    phonenumber: string | null;
  
    @ApiProperty({ description: 'Số CMND/CCCD', example: '012345678912', nullable: true })
    @Column("character varying", { name: "idcard", nullable: true, length: 20 })
    idcard: string | null;
  
    @ApiProperty({ description: 'Trạng thái sinh viên', example: 'approved', enum: ['pending', 'approved', 'rejected'], nullable: true })
    @Column("character varying", { name: "status", nullable: true, length: 20 })
    status: string | null;
  
    @ApiProperty({ type: () => Account , description: 'Tài khoản liên kết với sinh viên'})
    @OneToOne(() => Account, { onDelete: 'CASCADE' }) // Mối quan hệ 1-1
    @JoinColumn({ name: "accountid", referencedColumnName: "accountid" }) // Join trên cột accountid
    account: Account;

    @ApiProperty({ type: () => [RoomRegistration], description: 'Các đăng ký phòng của sinh viên' })
    @OneToMany(
      () => RoomRegistration,
      (roomregistration) => roomregistration.student
    )
    roomregistrations: RoomRegistration[];
  }
  