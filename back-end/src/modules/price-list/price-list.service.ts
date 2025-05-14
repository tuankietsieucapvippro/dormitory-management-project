import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsOrder } from 'typeorm';
import { CreatePriceListDto } from './dto/create-price-list.dto';
import { UpdatePriceListDto } from './dto/update-price-list.dto';
import { PriceList } from './entities/price-list.entity';

interface PaginationOptions {
  page: number;
  limit: number;
  search?: string;
  costType?: string;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
}

@Injectable()
export class PriceListService {
  constructor(
    @InjectRepository(PriceList)
    private priceListRepository: Repository<PriceList>,
  ) {}

  async create(createPriceListDto: CreatePriceListDto): Promise<PriceList> {
    // Kiểm tra xem costType đã tồn tại chưa
    const existingPrice = await this.priceListRepository.findOne({
      where: { costtype: createPriceListDto.costType }
    });

    if (existingPrice) {
      throw new BadRequestException(`Loại chi phí '${createPriceListDto.costType}' đã tồn tại`);
    }

    // Tạo dữ liệu trong bảng giá
    const priceList = this.priceListRepository.create({
      costtype: createPriceListDto.costType,
      price: createPriceListDto.price.toString(),
    });

    return await this.priceListRepository.save(priceList);
  }

  async findAll(): Promise<PriceList[]> {
    return this.priceListRepository.find({
      order: { priceid: 'ASC' },
    });
  }

  async findAllWithPagination(options: PaginationOptions): Promise<{ data: PriceList[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, search, costType, sortBy = 'priceid', sortOrder = 'ASC' } = options;
    
    const skip = (page - 1) * limit;
    
    const whereConditions: any = {};
    
    if (search) {
      whereConditions.costtype = ILike(`%${search}%`);
    }
    
    if (costType) {
      whereConditions.costtype = costType;
    }
    
    const order: FindOptionsOrder<PriceList> = {};
    order[sortBy] = sortOrder;
    
    const [result, total] = await this.priceListRepository.findAndCount({
      where: whereConditions,
      skip,
      take: limit,
      order,
    });
    
    return {
      data: result,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<PriceList> {
    const priceList = await this.priceListRepository.findOne({
      where: { priceid: id },
      relations: ['invoices', 'invoices2'],
    });
    
    if (!priceList) {
      throw new NotFoundException(`Bảng giá với ID ${id} không tồn tại`);
    }
    
    return priceList;
  }

  async findByCostType(costType: string): Promise<PriceList> {
    const priceList = await this.priceListRepository.findOne({
      where: { costtype: costType },
    });
    
    if (!priceList) {
      throw new NotFoundException(`Bảng giá cho '${costType}' không tồn tại`);
    }
    
    return priceList;
  }

  async update(id: number, updatePriceListDto: UpdatePriceListDto): Promise<PriceList> {
    const priceList = await this.findOne(id);
    
    // Kiểm tra nếu cập nhật costType
    if (updatePriceListDto.costType && updatePriceListDto.costType !== priceList.costtype) {
      const existingPrice = await this.priceListRepository.findOne({
        where: { costtype: updatePriceListDto.costType }
      });
  
      if (existingPrice) {
        throw new BadRequestException(`Loại chi phí '${updatePriceListDto.costType}' đã tồn tại`);
      }
      
      priceList.costtype = updatePriceListDto.costType;
    }
    
    // Cập nhật giá nếu được cung cấp
    if (updatePriceListDto.price !== undefined) {
      priceList.price = updatePriceListDto.price.toString();
    }
    
    return await this.priceListRepository.save(priceList);
  }

  async remove(id: number): Promise<{ message: string }> {
    const priceList = await this.findOne(id);
    
    // Kiểm tra xem bảng giá có đang được sử dụng trong hóa đơn không
    if ((priceList.invoices && priceList.invoices.length > 0) || 
        (priceList.invoices2 && priceList.invoices2.length > 0)) {
      throw new BadRequestException(
        `Không thể xóa bảng giá này vì nó đang được sử dụng trong hóa đơn`
      );
    }
    
    await this.priceListRepository.remove(priceList);
    return { message: `Đã xóa bảng giá ${priceList.costtype} thành công` };
  }

  async getPriceStatistics(): Promise<any> {
    // Thống kê theo loại chi phí
    const pricesByCostType = await this.priceListRepository
      .createQueryBuilder('price')
      .select('price.costtype', 'costType')
      .addSelect('price.price', 'price')
      .orderBy('price.costtype')
      .getRawMany();
    
    // Tính giá trung bình
    const averagePrice = await this.priceListRepository
      .createQueryBuilder('price')
      .select('AVG(price.price::numeric)', 'averagePrice')
      .getRawOne();
    
    return {
      pricesByCostType,
      averagePrice
    };
  }
}
