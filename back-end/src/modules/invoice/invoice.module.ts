import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { Invoice } from './entities/invoice.entity';
import { Room } from '../room/entities/room.entity';
import { PriceList } from '../price-list/entities/price-list.entity';
import { Utilities } from '../utilities/entities/utility.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, Room, PriceList, Utilities])
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService]
})
export class InvoiceModule {}
