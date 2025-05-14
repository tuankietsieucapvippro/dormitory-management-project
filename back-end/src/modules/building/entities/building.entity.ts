import {
    Column,
    Entity,
    Index,
    OneToMany,
    PrimaryGeneratedColumn,
  } from "typeorm";
  import { Room } from "../../room/entities/room.entity";
  
  @Index("building_pkey", ["buildingid"], { unique: true })
  @Index("building_buildingname_key", ["buildingname"], { unique: true })
  @Entity("building", { schema: "public" })
  export class Building {
    @PrimaryGeneratedColumn({ type: "integer", name: "buildingid" })
    buildingid: number;
  
    @Column("character varying", {
      name: "buildingname",
      unique: true,
      length: 30,
    })
    buildingname: string;
  
    @Column("character varying", {
      name: "description",
      nullable: true,
      length: 255,
    })
    description: string | null;
  
    @OneToMany(() => Room, (room) => room.building)
    rooms: Room[];
  }
  