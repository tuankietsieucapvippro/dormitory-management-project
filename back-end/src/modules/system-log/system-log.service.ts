import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsOrder, Between } from 'typeorm';
import { CreateSystemLogDto } from './dto/create-system-log.dto';
import { UpdateSystemLogDto } from './dto/update-system-log.dto';
import { SystemLog } from './entities/system-log.entity';

interface PaginationOptions {
  page: number;
  limit: number;
  search?: string;
  actionName?: string;
  tableName?: string;
  userId?: number;
  startDate?: Date;
  endDate?: Date;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
}

@Injectable()
export class SystemLogService {
  constructor(
    @InjectRepository(SystemLog)
    private systemLogRepository: Repository<SystemLog>,
  ) {}

  async create(createSystemLogDto: CreateSystemLogDto): Promise<SystemLog> {
    const systemLog = this.systemLogRepository.create({
      actionname: createSystemLogDto.actionname,
      tablename: createSystemLogDto.tablename,
      recordid: createSystemLogDto.recordid,
      description: createSystemLogDto.description,
      actiondate: new Date(),
      user: { accountid: createSystemLogDto.userid },
    });

    return this.systemLogRepository.save(systemLog);
  }

  async findAll(): Promise<SystemLog[]> {
    return this.systemLogRepository.find({
      relations: ['user'],
      order: { actiondate: 'DESC' },
    });
  }

  async findAllWithPagination(options: PaginationOptions): Promise<{ data: SystemLog[]; total: number; page: number; limit: number }> {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      actionName, 
      tableName, 
      userId,
      startDate,
      endDate,
      sortBy = 'actiondate', 
      sortOrder = 'DESC' 
    } = options;
    
    const skip = (page - 1) * limit;
    
    const whereConditions: any = {};
    
    if (search) {
      whereConditions.description = ILike(`%${search}%`);
    }
    
    if (actionName) {
      whereConditions.actionname = ILike(`%${actionName}%`);
    }
    
    if (tableName) {
      whereConditions.tablename = ILike(`%${tableName}%`);
    }
    
    if (userId) {
      whereConditions.user = { accountid: userId };
    }
    
    if (startDate && endDate) {
      whereConditions.actiondate = Between(startDate, endDate);
    } else if (startDate) {
      whereConditions.actiondate = Between(startDate, new Date());
    } else if (endDate) {
      whereConditions.actiondate = Between(new Date(0), endDate);
    }
    
    const order: FindOptionsOrder<SystemLog> = {};
    order[sortBy] = sortOrder;
    
    const [result, total] = await this.systemLogRepository.findAndCount({
      where: whereConditions,
      relations: ['user'],
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

  async findOne(id: number): Promise<SystemLog> {
    const systemLog = await this.systemLogRepository.findOne({
      where: { logid: id },
      relations: ['user'],
    });
    
    if (!systemLog) {
      throw new NotFoundException(`Không tìm thấy log với ID ${id}`);
    }
    
    return systemLog;
  }
  
  async findByUser(userId: number): Promise<SystemLog[]> {
    return this.systemLogRepository.find({
      where: { user: { accountid: userId } },
      relations: ['user'],
      order: { actiondate: 'DESC' },
    });
  }
  
  async findByTable(tableName: string): Promise<SystemLog[]> {
    return this.systemLogRepository.find({
      where: { tablename: ILike(`%${tableName}%`) },
      relations: ['user'],
      order: { actiondate: 'DESC' },
    });
  }
  
  async findByAction(actionName: string): Promise<SystemLog[]> {
    return this.systemLogRepository.find({
      where: { actionname: ILike(`%${actionName}%`) },
      relations: ['user'],
      order: { actiondate: 'DESC' },
    });
  }
  
  async findByDateRange(startDate: Date, endDate: Date): Promise<SystemLog[]> {
    return this.systemLogRepository.find({
      where: { actiondate: Between(startDate, endDate) },
      relations: ['user'],
      order: { actiondate: 'DESC' },
    });
  }

  async update(id: number, updateSystemLogDto: UpdateSystemLogDto): Promise<SystemLog> {
    const systemLog = await this.findOne(id);
    
    if (updateSystemLogDto.actionname) {
      systemLog.actionname = updateSystemLogDto.actionname;
    }
    
    if (updateSystemLogDto.tablename) {
      systemLog.tablename = updateSystemLogDto.tablename;
    }
    
    if (updateSystemLogDto.recordid !== undefined) {
      systemLog.recordid = updateSystemLogDto.recordid;
    }
    
    if (updateSystemLogDto.description !== undefined) {
      systemLog.description = updateSystemLogDto.description;
    }
    
    if (updateSystemLogDto.userid) {
      systemLog.user = { accountid: updateSystemLogDto.userid } as any;
    }
    
    return this.systemLogRepository.save(systemLog);
  }

  async remove(id: number): Promise<{ message: string }> {
    const systemLog = await this.findOne(id);
    await this.systemLogRepository.remove(systemLog);
    
    return { message: `Đã xóa log với ID ${id} thành công` };
  }
  
  async getLogStatistics(): Promise<any> {
    // Thống kê theo loại hành động
    const logsByAction = await this.systemLogRepository
      .createQueryBuilder('log')
      .select('log.actionname', 'actionName')
      .addSelect('COUNT(log.logid)', 'count')
      .groupBy('log.actionname')
      .orderBy('count', 'DESC')
      .getRawMany();
    
    // Thống kê theo bảng dữ liệu
    const logsByTable = await this.systemLogRepository
      .createQueryBuilder('log')
      .select('log.tablename', 'tableName')
      .addSelect('COUNT(log.logid)', 'count')
      .groupBy('log.tablename')
      .orderBy('count', 'DESC')
      .getRawMany();
    
    // Thống kê theo người dùng
    const logsByUser = await this.systemLogRepository
      .createQueryBuilder('log')
      .leftJoin('log.user', 'user')
      .select('user.username', 'username')
      .addSelect('COUNT(log.logid)', 'count')
      .groupBy('user.username')
      .orderBy('count', 'DESC')
      .getRawMany();
    
    // Thống kê theo ngày
    const logsByDate = await this.systemLogRepository
      .createQueryBuilder('log')
      .select("TO_CHAR(log.actiondate, 'YYYY-MM-DD')", 'date')
      .addSelect('COUNT(log.logid)', 'count')
      .groupBy("TO_CHAR(log.actiondate, 'YYYY-MM-DD')")
      .orderBy('date', 'DESC')
      .limit(30)
      .getRawMany();
    
    return {
      logsByAction,
      logsByTable,
      logsByUser,
      logsByDate
    };
  }
}
