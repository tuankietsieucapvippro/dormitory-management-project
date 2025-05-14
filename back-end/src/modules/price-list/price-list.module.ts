import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceListService } from './price-list.service';
import { PriceListController } from './price-list.controller';
import { PriceList } from './entities/price-list.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PriceList])
  ],
  controllers: [PriceListController],
  providers: [PriceListService],
  exports: [PriceListService]
})
export class PriceListModule {}
