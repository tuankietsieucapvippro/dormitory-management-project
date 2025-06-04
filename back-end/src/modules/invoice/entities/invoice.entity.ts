import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Check
  } from "typeorm";
  import { PriceList } from "../../price-list/entities/price-list.entity";
  import { Room } from "../../room/entities/room.entity";
  import { Utilities } from "../../utilities/entities/utility.entity";
  
  @Index("invoice_pkey", ["invoiceid"], { unique: true })
  @Entity("invoice", { schema: "public" })
  @Check("electricitypriceid IS NOT NULL OR waterpriceid IS NOT NULL")
  @Check("status IN ('unpaid', 'paid')")
  export class Invoice {
    @PrimaryGeneratedColumn({ type: "integer", name: "invoiceid" })
    invoiceid: number;
    
    @Column("integer", { name: "roomid", nullable: true })
    roomid: number | null;
    
    @Column("integer", { name: "utilitiesid", nullable: true })
    utilitiesid: number | null;
  
    @Column("date", { name: "invoicedate" })
    invoicedate: string;
  
    @Column("character varying", { name: "status", length: 30 })
    status: string;
  
    @Column("integer", { name: "electricitypriceid", nullable: true })
    electricitypriceid: number | null;
  
    @Column("integer", { name: "waterpriceid", nullable: true })
    waterpriceid: number | null;
  
    @ManyToOne(() => PriceList, (pricelist) => pricelist.invoices, {
      onDelete: "SET NULL",
    })
    @JoinColumn([{ name: "electricitypriceid", referencedColumnName: "priceid" }])
    electricityprice: PriceList;
  
    @ManyToOne(() => Room, (room) => room.invoices)
    @JoinColumn([{ name: "roomid", referencedColumnName: "roomid" }])
    room: Room;
  
    @ManyToOne(() => Utilities, (utilities) => utilities.invoices)
    @JoinColumn([{ name: "utilitiesid", referencedColumnName: "utilitiesid" }])
    utilities: Utilities;
  
    @ManyToOne(() => PriceList, (pricelist) => pricelist.invoices2, {
      onDelete: "SET NULL",
    })
    @JoinColumn([{ name: "waterpriceid", referencedColumnName: "priceid" }])
    waterprice: PriceList;
  }
  