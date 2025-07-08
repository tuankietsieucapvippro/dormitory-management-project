import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
  } from "typeorm";
  import { Role } from "../../role/entities/role.entity";
  import { SystemLog } from "../../system-log/entities/system-log.entity";
  
  @Index("account_pkey", ["accountid"], { unique: true })
  @Index("account_username_key", ["username"], { unique: true })
  @Entity("account", { schema: "public" })
  export class Account {
    @PrimaryGeneratedColumn({ type: "integer", name: "accountid" })
    accountid: number;
  
    @Column("character varying", { name: "username", unique: true, length: 20 })
    username: string;
  
    @Column("character varying", { name: "password", length: 255 })
    password: string;

    @Column("integer", { name: "roleid", nullable: true })
    roleid: number | null;

    @ManyToOne(() => Role, (role) => role.accounts)
    @JoinColumn([{ name: "roleid", referencedColumnName: "roleid" }])
    role: Role;
  
    @OneToMany(() => SystemLog, (systemlog) => systemlog.user)
    systemlogs: SystemLog[];
  }
  