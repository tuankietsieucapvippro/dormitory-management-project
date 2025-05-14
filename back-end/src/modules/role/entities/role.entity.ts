import {
    Column,
    Entity,
    Index,
    OneToMany,
    PrimaryGeneratedColumn,
  } from "typeorm";
  import { Account } from "../../account/entities/account.entity";
  import { ApiProperty } from "@nestjs/swagger";
  
  @Index("role_pkey", ["roleid"], { unique: true })
  @Entity("role", { schema: "public" })
  export class Role {
    @ApiProperty({ description: 'ID của vai trò', example: 1 })
    @PrimaryGeneratedColumn({ type: "integer", name: "roleid" })
    roleid: number;
  
    @ApiProperty({ description: 'Tên vai trò', example: 'Admin' })
    @Column("character varying", { name: "rolename", length: 50 })
    rolename: string;
  
    @ApiProperty({ description: 'Danh sách tài khoản có vai trò này', type: [Account] })
    @OneToMany(() => Account, (account) => account.role)
    accounts: Account[];
  }
  