import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
  } from "typeorm";
  import { Invoice } from "../../invoice/entities/invoice.entity";
  import { Building } from "../../building/entities/building.entity";
  import { RoomType } from "../../room-type/entities/room-type.entity";
  import { RoomRegistration } from "../../room-registration/entities/room-registration.entity";
  import { Utilities } from "../../utilities/entities/utility.entity";
  
  @Index("room_roomname_buildingid_key", ["buildingid", "roomname"], {
    unique: true,
  })
  @Index("room_pkey", ["roomid"], { unique: true })
  @Entity("room", { schema: "public" })
  export class Room {
    @PrimaryGeneratedColumn({ type: "integer", name: "roomid" })
    roomid: number;
  
    @Column("integer", { name: "buildingid", nullable: true })
    buildingid: number | null;
  
    @Column("character varying", { name: "roomname", length: 30 })
    roomname: string;
  
    @Column("character varying", { name: "status", nullable: true, length: 30 })
    status: string | null;
  
    @Column("integer", { name: "bedcount", nullable: true })
    bedcount: number | null;
  
    @OneToMany(() => Invoice, (invoice) => invoice.room)
    invoices: Invoice[];
  
    @ManyToOne(() => Building, (building) => building.rooms, {
      onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "buildingid", referencedColumnName: "buildingid" }])
    building: Building;
  
    @ManyToOne(() => RoomType, (roomtype) => roomtype.rooms, {
      onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "roomtypeid", referencedColumnName: "roomtypeid" }])
    roomtype: RoomType;
  
    @OneToMany(
      () => RoomRegistration,
      (roomregistration) => roomregistration.room
    )
    roomregistrations: RoomRegistration[];
  
    @OneToMany(() => Utilities, (utilities) => utilities.room)
    utilities: Utilities[];
  }
  