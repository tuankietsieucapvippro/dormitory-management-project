import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
  } from "typeorm";
  import { Account } from "../../account/entities/account.entity";
  
  @Index("systemlog_pkey", ["logid"], { unique: true })
  @Entity("systemlog", { schema: "public" })
  export class SystemLog {
    @PrimaryGeneratedColumn({ type: "integer", name: "logid" })
    logid: number;
  
    @Column("character varying", { name: "actionname", length: 50 })
    actionname: string;
  
    @Column("character varying", { name: "tablename", length: 50 })
    tablename: string;
  
    @Column("integer", { name: "recordid" })
    recordid: number;
  
    @Column("timestamp without time zone", {
      name: "actiondate",
      nullable: true,
      default: () => "CURRENT_TIMESTAMP",
    })
    actiondate: Date | null;
  
    @Column("text", { name: "description", nullable: true })
    description: string | null;

    @Column("integer", { name: "userid", nullable: true })
    userid: number | null;

    @ManyToOne(() => Account, (account) => account.systemlogs, { nullable: true }) // Cho phép user là null
    @JoinColumn([{ name: "userid", referencedColumnName: "accountid" }]) // TypeORM thường tự suy luận nullable từ quan hệ
    user: Account | null; // Cho phép user là null
  }
  