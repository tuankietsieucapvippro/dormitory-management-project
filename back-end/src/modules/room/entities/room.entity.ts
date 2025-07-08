import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    Check
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
  @Index("room_roomname_buildingid_key", ["roomname", "buildingid"], { unique: true })
  @Entity("room", { schema: "public" })
  @Check("status IN ('available', 'occupied', 'maintenance')")
  export class Room {
    @PrimaryGeneratedColumn({ type: "integer", name: "roomid" })
    roomid: number;

    @Column("integer", { name: "buildingid" }) // Khóa ngoại không nên nullable trừ khi DB cho phép
    buildingid: number;

    @Column("integer", { name: "roomtypeid" }) // Khóa ngoại không nên nullable trừ khi DB cho phép
    roomtypeid: number;

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
      nullable: false, // Đảm bảo khóa ngoại không null
    })
    @JoinColumn([{ name: "buildingid", referencedColumnName: "buildingid" }])
    building: Building;
  
    @ManyToOne(() => RoomType, (roomtype) => roomtype.rooms, {
      onDelete: "CASCADE",
      nullable: false, // Đảm bảo khóa ngoại không null
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
  