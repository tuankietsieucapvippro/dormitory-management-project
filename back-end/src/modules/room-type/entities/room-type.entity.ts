import {
    Column,
    Entity,
    Index,
    OneToMany,
    PrimaryGeneratedColumn,
    Check
  } from "typeorm";
  import { Room } from "../../room/entities/room.entity";
  
  @Index("roomtype_pkey", ["roomtypeid"], { unique: true })
  @Entity("roomtype", { schema: "public" })
  @Check("gender IN ('Male', 'Female')")
  @Check("price >= 0")
  export class RoomType {
    @PrimaryGeneratedColumn({ type: "integer", name: "roomtypeid" })
    roomtypeid: number;
  
    @Column("character varying", { name: "roomtypename", length: 30 })
    roomtypename: string;
  
    @Column("numeric", { name: "price", nullable: true, precision: 12, scale: 2 })
    price: string | null;
  
    @Column("character varying", {
      name: "description",
      nullable: true,
      length: 255,
    })
    description: string | null;
  
    @Column("character varying", { name: "gender", nullable: true, length: 10 })
    gender: string | null;
  
    @OneToMany(() => Room, (room) => room.roomtype)
    rooms: Room[];
  }
  