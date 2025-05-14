import {
    Column,
    Entity,
    Index,
    OneToMany,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    Check
  } from "typeorm";
  import { RoomRegistration } from "../../room-registration/entities/room-registration.entity";
  import { Account } from "../../account/entities/account.entity";
  
  @Index("student_email_key", ["email"], { unique: true })
  @Index("student_phonenumber_key", ["phonenumber"], { unique: true })
  @Index("student_studentcode_key", ["studentcode"], { unique: true })
  @Index("student_pkey", ["accountid"], { unique: true })
  @Entity("student", { schema: "public" })
  @Check("gender IN ('Male', 'Female')")
  @Check("status IN ('Pending', 'Approved', 'Rejected')")
  @Check("dateofbirth <= CURRENT_DATE")
  export class Student {
    @PrimaryGeneratedColumn({ type: "integer", name: "accountid" })
    accountid: number;
  
    @Column("character varying", { name: "fullname", length: 70 })
    fullname: string;
  
    @Column("character varying", {
      name: "studentcode",
      unique: true,
      length: 10,
    })
    studentcode: string;
  
    @Column("character varying", { name: "class", nullable: true, length: 30 })
    class: string | null;
  
    @Column("character varying", { name: "gender", nullable: true, length: 10 })
    gender: string | null;
  
    @Column("date", { name: "dateofbirth", nullable: true })
    dateofbirth: string | null;
  
    @Column("character varying", {
      name: "birthplace",
      nullable: true,
      length: 100,
    })
    birthplace: string | null;
  
    @Column("character varying", { name: "address", nullable: true, length: 100 })
    address: string | null;
  
    @Column("character varying", {
      name: "email",
      nullable: true,
      unique: true,
      length: 100,
    })
    email: string | null;
  
    @Column("character varying", {
      name: "phonenumber",
      nullable: true,
      unique: true,
      length: 10,
    })
    phonenumber: string | null;
  
    @Column("character varying", { name: "idcard", nullable: true, length: 20 })
    idcard: string | null;
  
    @Column("character varying", { name: "status", nullable: true, length: 20 })
    status: string | null;
  
    @OneToMany(
      () => RoomRegistration,
      (roomregistration) => roomregistration.student
    )
    roomregistrations: RoomRegistration[];

    @ManyToOne(
      () => Account,
      (account) => account.accountid
    )
    @JoinColumn([{ name: "accountid", referencedColumnName: "accountid" }])
    account: Account;
  }
  