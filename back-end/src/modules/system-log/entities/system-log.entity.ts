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
  
    @ManyToOne(() => Account, (account) => account.systemlogs)
    @JoinColumn([{ name: "userid", referencedColumnName: "accountid" }])
    user: Account;
  }
  