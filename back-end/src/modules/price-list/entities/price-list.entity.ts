import {
    Column,
    Entity,
    Index,
    OneToMany,
    PrimaryGeneratedColumn,
    Check
  } from "typeorm";
  import { Invoice } from "../../invoice/entities/invoice.entity";
  
  @Index("pricelist_pkey", ["priceid"], { unique: true })
  @Entity("pricelist", { schema: "public" })
  @Check("price >= 0")
  export class PriceList {
    @PrimaryGeneratedColumn({ type: "integer", name: "priceid" })
    priceid: number;
  
    @Column("character varying", { name: "costtype", length: 50 })
    costtype: string;
  
    @Column("numeric", { name: "price", precision: 10, scale: 2 })
    price: string;
  
    @OneToMany(() => Invoice, (invoice) => invoice.electricityprice)
    invoices: Invoice[];
  
    @OneToMany(() => Invoice, (invoice) => invoice.waterprice)
    invoices2: Invoice[];
  }
  