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
  import { Room } from "../../room/entities/room.entity";
  
  @Index("utilities_pkey", ["utilitiesid"], { unique: true })
  @Entity("utilities", { schema: "public" })
  @Check("currentelectricitymeter >= previouselectricitymeter")
  @Check("currentwatermeter >= previouswatermeter")
  @Check("enddate >= startdate")
  export class Utilities {
    @PrimaryGeneratedColumn({ type: "integer", name: "utilitiesid" })
    utilitiesid: number;
  
    @Column("date", { name: "startdate" })
    startdate: string;
  
    @Column("date", { name: "enddate" })
    enddate: string;
  
    @Column("integer", { name: "previouselectricitymeter" })
    previouselectricitymeter: number;
  
    @Column("integer", { name: "currentelectricitymeter" })
    currentelectricitymeter: number;
  
    @Column("integer", { name: "previouswatermeter" })
    previouswatermeter: number;
  
    @Column("integer", { name: "currentwatermeter" })
    currentwatermeter: number;
  
    @OneToMany(() => Invoice, (invoice) => invoice.utilities)
    invoices: Invoice[];
  
    @ManyToOne(() => Room, (room) => room.utilities, { onDelete: "CASCADE" })
    @JoinColumn([{ name: "roomid", referencedColumnName: "roomid" }])
    room: Room;
  }
  