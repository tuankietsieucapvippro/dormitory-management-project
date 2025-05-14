import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsOrder, FindOptionsWhere } from 'typeorm';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Invoice } from './entities/invoice.entity';
import { Room } from '../room/entities/room.entity';
import { PriceList } from '../price-list/entities/price-list.entity';
import { Utilities } from '../utilities/entities/utility.entity';

interface PaginationOptions {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  roomId?: number;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
}

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    @InjectRepository(PriceList)
    private priceListRepository: Repository<PriceList>,
    @InjectRepository(Utilities)
    private utilitiesRepository: Repository<Utilities>,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    // Validate room exists
    const room = await this.roomRepository.findOne({
      where: { roomid: createInvoiceDto.roomId }
    });

    if (!room) {
      throw new NotFoundException(`Không tìm thấy phòng với ID ${createInvoiceDto.roomId}`);
    }

    // Create invoice entity
    const invoice = this.invoiceRepository.create({
      invoicedate: createInvoiceDto.invoiceDate,
      status: createInvoiceDto.status,
      roomid: createInvoiceDto.roomId
    });

    // Set room relation
    invoice.room = room;

    // Set utilities relation if provided
    if (createInvoiceDto.utilitiesId !== null && createInvoiceDto.utilitiesId !== undefined) {
      const utilities = await this.utilitiesRepository.findOne({
        where: { utilitiesid: createInvoiceDto.utilitiesId }
      });
      
      if (!utilities) {
        throw new NotFoundException(`Không tìm thấy tiện ích với ID ${createInvoiceDto.utilitiesId}`);
      }
      
      invoice.utilities = utilities;
      invoice.utilitiesid = createInvoiceDto.utilitiesId;
    }

    // Set electricity price relation if provided
    if (createInvoiceDto.electricityPriceId !== null && createInvoiceDto.electricityPriceId !== undefined) {
      const electricityPrice = await this.priceListRepository.findOne({
        where: { priceid: createInvoiceDto.electricityPriceId }
      });
      
      if (!electricityPrice) {
        throw new NotFoundException(`Không tìm thấy giá điện với ID ${createInvoiceDto.electricityPriceId}`);
      }
      
      invoice.electricityprice = electricityPrice;
      invoice.electricitypriceid = createInvoiceDto.electricityPriceId;
    }

    // Set water price relation if provided
    if (createInvoiceDto.waterPriceId !== null && createInvoiceDto.waterPriceId !== undefined) {
      const waterPrice = await this.priceListRepository.findOne({
        where: { priceid: createInvoiceDto.waterPriceId }
      });
      
      if (!waterPrice) {
        throw new NotFoundException(`Không tìm thấy giá nước với ID ${createInvoiceDto.waterPriceId}`);
      }
      
      invoice.waterprice = waterPrice;
      invoice.waterpriceid = createInvoiceDto.waterPriceId;
    }

    return this.invoiceRepository.save(invoice);
  }

  async findAll(): Promise<Invoice[]> {
    return this.invoiceRepository.find({
      relations: ['room', 'utilities', 'electricityprice', 'waterprice'],
      order: { invoiceid: 'DESC' },
    });
  }

  async findAllWithPagination(options: PaginationOptions): Promise<{ data: Invoice[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, search, status, startDate, endDate, roomId, sortBy = 'invoiceid', sortOrder = 'DESC' } = options;
    
    const skip = (page - 1) * limit;
    
    const whereConditions: FindOptionsWhere<Invoice> = {};
    
    if (status) {
      whereConditions.status = status;
    }
    
    if (roomId) {
      whereConditions.room = { roomid: roomId };
    }
    
    if (startDate && endDate) {
      // Format dates as strings (YYYY-MM-DD) to match the entity type
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      whereConditions.invoicedate = Between(startDateStr, endDateStr);
    }
    
    const order: FindOptionsOrder<Invoice> = {};
    order[sortBy] = sortOrder;
    
    let queryBuilder = this.invoiceRepository.createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.room', 'room')
      .leftJoinAndSelect('invoice.utilities', 'utilities')
      .leftJoinAndSelect('invoice.electricityprice', 'electricityprice')
      .leftJoinAndSelect('invoice.waterprice', 'waterprice')
      .leftJoinAndSelect('room.building', 'building');
      
    if (status) {
      queryBuilder = queryBuilder.andWhere('invoice.status = :status', { status });
    }
    
    if (roomId) {
      queryBuilder = queryBuilder.andWhere('room.roomid = :roomId', { roomId });
    }
    
    if (startDate && endDate) {
      queryBuilder = queryBuilder.andWhere('invoice.invoicedate BETWEEN :startDate AND :endDate', { 
        startDate, 
        endDate 
      });
    }
    
    if (search) {
      queryBuilder = queryBuilder.andWhere('(CAST(invoice.invoiceid AS TEXT) LIKE :search OR building.buildingname LIKE :search OR room.roomnumber LIKE :search)', {
        search: `%${search}%`
      });
    }
    
    queryBuilder = queryBuilder
      .orderBy(`invoice.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit);
      
    const [result, total] = await queryBuilder.getManyAndCount();
    
    return {
      data: result,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { invoiceid: id },
      relations: ['room', 'utilities', 'electricityprice', 'waterprice', 'room.building'],
    });
    
    if (!invoice) {
      throw new NotFoundException(`Không tìm thấy hóa đơn với ID ${id}`);
    }
    
    return invoice;
  }

  async findByRoom(roomId: number): Promise<Invoice[]> {
    return this.invoiceRepository.find({
      where: { room: { roomid: roomId } },
      relations: ['room', 'utilities', 'electricityprice', 'waterprice'],
      order: { invoicedate: 'DESC' },
    });
  }

  async findByStatus(status: string): Promise<Invoice[]> {
    return this.invoiceRepository.find({
      where: { status },
      relations: ['room', 'utilities', 'electricityprice', 'waterprice'],
      order: { invoicedate: 'DESC' },
    });
  }

  async update(id: number, updateInvoiceDto: UpdateInvoiceDto): Promise<Invoice> {
    const invoice = await this.findOne(id);
    
    // Xác định nếu có bất kỳ trường quan hệ nào cần đặt thành null
    const needsRawUpdate = 
      updateInvoiceDto.utilitiesId === null || 
      updateInvoiceDto.electricityPriceId === null || 
      updateInvoiceDto.waterPriceId === null;
    
    if (!needsRawUpdate) {
      // Cập nhật bình thường khi không có trường quan hệ nào được đặt thành null
      if (updateInvoiceDto.invoiceDate) {
        invoice.invoicedate = updateInvoiceDto.invoiceDate;
      }
      
      if (updateInvoiceDto.status) {
        invoice.status = updateInvoiceDto.status;
      }
      
      if (updateInvoiceDto.roomId) {
        const room = await this.roomRepository.findOne({
          where: { roomid: updateInvoiceDto.roomId }
        });
        
        if (!room) {
          throw new NotFoundException(`Không tìm thấy phòng với ID ${updateInvoiceDto.roomId}`);
        }
        
        invoice.room = room;
        invoice.roomid = updateInvoiceDto.roomId;
      }
      
      if (updateInvoiceDto.utilitiesId) {
        const utilities = await this.utilitiesRepository.findOne({
          where: { utilitiesid: updateInvoiceDto.utilitiesId }
        });
        
        if (!utilities) {
          throw new NotFoundException(`Không tìm thấy tiện ích với ID ${updateInvoiceDto.utilitiesId}`);
        }
        
        invoice.utilities = utilities;
        invoice.utilitiesid = updateInvoiceDto.utilitiesId;
      }
      
      if (updateInvoiceDto.electricityPriceId) {
        const electricityPrice = await this.priceListRepository.findOne({
          where: { priceid: updateInvoiceDto.electricityPriceId }
        });
        
        if (!electricityPrice) {
          throw new NotFoundException(`Không tìm thấy giá điện với ID ${updateInvoiceDto.electricityPriceId}`);
        }
        
        invoice.electricityprice = electricityPrice;
        invoice.electricitypriceid = updateInvoiceDto.electricityPriceId;
      }
      
      if (updateInvoiceDto.waterPriceId) {
        const waterPrice = await this.priceListRepository.findOne({
          where: { priceid: updateInvoiceDto.waterPriceId }
        });
        
        if (!waterPrice) {
          throw new NotFoundException(`Không tìm thấy giá nước với ID ${updateInvoiceDto.waterPriceId}`);
        }
        
        invoice.waterprice = waterPrice;
        invoice.waterpriceid = updateInvoiceDto.waterPriceId;
      }
      
      return this.invoiceRepository.save(invoice);
    } else {
      // Sử dụng QueryRunner để xử lý các trường quan hệ null
      const queryRunner = this.invoiceRepository.manager.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      
      try {
        // Cập nhật các trường cơ bản
        if (updateInvoiceDto.invoiceDate) {
          invoice.invoicedate = updateInvoiceDto.invoiceDate;
        }
        
        if (updateInvoiceDto.status) {
          invoice.status = updateInvoiceDto.status;
        }
        
        // Cập nhật quan hệ room nếu có
        if (updateInvoiceDto.roomId) {
          const room = await this.roomRepository.findOne({
            where: { roomid: updateInvoiceDto.roomId }
          });
          
          if (!room) {
            throw new NotFoundException(`Không tìm thấy phòng với ID ${updateInvoiceDto.roomId}`);
          }
          
          invoice.room = room;
          invoice.roomid = updateInvoiceDto.roomId;
        }
        
        // Lưu các thay đổi không liên quan đến quan hệ null
        const savedInvoice = await queryRunner.manager.save(invoice);
        
        // Xây dựng câu lệnh SQL để cập nhật các trường quan hệ null
        let updateQuery = `UPDATE invoice SET `;
        const updateFields: string[] = [];
        const params: any = { id };
        
        if (updateInvoiceDto.utilitiesId === null) {
          updateFields.push(`utilitiesid = NULL`);
        } else if (updateInvoiceDto.utilitiesId !== undefined) {
          updateFields.push(`utilitiesid = :utilitiesId`);
          params.utilitiesId = updateInvoiceDto.utilitiesId;
        }
        
        if (updateInvoiceDto.electricityPriceId === null) {
          updateFields.push(`electricitypriceid = NULL`);
        } else if (updateInvoiceDto.electricityPriceId !== undefined) {
          updateFields.push(`electricitypriceid = :electricityPriceId`);
          params.electricityPriceId = updateInvoiceDto.electricityPriceId;
        }
        
        if (updateInvoiceDto.waterPriceId === null) {
          updateFields.push(`waterpriceid = NULL`);
        } else if (updateInvoiceDto.waterPriceId !== undefined) {
          updateFields.push(`waterpriceid = :waterPriceId`);
          params.waterPriceId = updateInvoiceDto.waterPriceId;
        }
        
        if (updateFields.length > 0) {
          updateQuery += updateFields.join(', ') + ` WHERE invoiceid = :id`;
          await queryRunner.query(updateQuery, params);
        }
        
        await queryRunner.commitTransaction();
        
        return this.findOne(id);
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    }
  }

  async remove(id: number): Promise<void> {
    const invoice = await this.findOne(id);
    await this.invoiceRepository.remove(invoice);
  }

  async getInvoiceStatistics(): Promise<any> {
    // Số lượng hóa đơn theo trạng thái
    const invoicesByStatus = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select('invoice.status', 'status')
      .addSelect('COUNT(invoice.invoiceid)', 'count')
      .groupBy('invoice.status')
      .getRawMany();
    
    // Tổng số hóa đơn theo tháng
    const invoicesByMonth = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select("TO_CHAR(invoice.invoicedate, 'YYYY-MM')", 'month')
      .addSelect('COUNT(invoice.invoiceid)', 'count')
      .groupBy("TO_CHAR(invoice.invoicedate, 'YYYY-MM')")
      .orderBy("TO_CHAR(invoice.invoicedate, 'YYYY-MM')")
      .getRawMany();
    
    return {
      invoicesByStatus,
      invoicesByMonth
    };
  }
  
  async calculateTotalByInvoiceId(invoiceId: number): Promise<{ totalElectricity: number; totalWater: number; total: number }> {
    const invoice = await this.findOne(invoiceId);
    
    if (!invoice.utilities || !invoice.electricityprice || !invoice.waterprice) {
      throw new NotFoundException('Không thể tính toán tổng tiền do thiếu thông tin tiện ích hoặc bảng giá');
    }
    
    // Calculate electricity usage and cost
    const electricityUsage = invoice.utilities.currentelectricitymeter - invoice.utilities.previouselectricitymeter;
    const electricityPrice = parseFloat(invoice.electricityprice.price);
    const totalElectricity = electricityUsage * electricityPrice;
    
    // Calculate water usage and cost
    const waterUsage = invoice.utilities.currentwatermeter - invoice.utilities.previouswatermeter;
    const waterPrice = parseFloat(invoice.waterprice.price);
    const totalWater = waterUsage * waterPrice;
    
    // Total cost
    const total = totalElectricity + totalWater;
    
    return {
      totalElectricity,
      totalWater,
      total
    };
  }
}
