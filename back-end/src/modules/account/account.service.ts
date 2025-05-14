import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Equal } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Account } from './entities/account.entity';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

interface PaginationOptions {
  page: number;
  limit: number;
  search?: string;
  roleId?: number;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
}

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}

  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    // Kiểm tra username đã tồn tại chưa
    const existingAccount = await this.accountRepository.findOne({
      where: { username: createAccountDto.username }
    });

    if (existingAccount) {
      throw new BadRequestException('Tên đăng nhập đã tồn tại');
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(createAccountDto.password, 10);

    // Tạo account mới với role nếu có
    const account = this.accountRepository.create({
      username: createAccountDto.username,
      password: hashedPassword
    });

    if (createAccountDto.roleId) {
      account.role = { roleid: createAccountDto.roleId } as any;
    }

    // Lưu vào database
    return this.accountRepository.save(account);
  }

  async findAll(): Promise<Account[]> {
    return this.accountRepository.find({
      relations: ['role']
    });
  }

  async findAllWithPagination(
    options: PaginationOptions
  ): Promise<[Account[], number]> {
    const { page, limit, search, roleId, sortBy, sortOrder } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.accountRepository.createQueryBuilder('account')
      .leftJoinAndSelect('account.role', 'role');

    // Thêm điều kiện tìm kiếm nếu có
    if (search) {
      queryBuilder.andWhere('account.username ILIKE :search', {
        search: `%${search}%`,
      });
    }

    // Lọc theo vai trò
    if (roleId) {
      queryBuilder.andWhere('role.roleid = :roleId', { roleId });
    }

    // Thêm sắp xếp
    if (['accountid', 'username'].includes(sortBy)) {
      queryBuilder.orderBy(`account.${sortBy}`, sortOrder);
    } else if (sortBy === 'roleName') {
      queryBuilder.orderBy('role.rolename', sortOrder);
    } else {
      queryBuilder.orderBy('account.accountid', sortOrder);
    }

    // Thêm phân trang
    queryBuilder.skip(skip).take(limit);

    // Thực hiện truy vấn và đếm tổng số bản ghi
    const [accounts, total] = await queryBuilder.getManyAndCount();

    return [accounts, total];
  }

  async findOne(id: number): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: { accountid: id },
      relations: ['role']
    });

    if (!account) {
      throw new NotFoundException(`Không tìm thấy tài khoản với ID ${id}`);
    }

    return account;
  }

  async findByUsername(username: string): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: { username },
      relations: ['role']
    });

    if (!account) {
      throw new NotFoundException(`Không tìm thấy tài khoản với username ${username}`);
    }

    return account;
  }

  async update(id: number, updateAccountDto: UpdateAccountDto): Promise<Account> {
    // Kiểm tra tài khoản có tồn tại không
    const account = await this.findOne(id);
    
    // Kiểm tra nếu đổi username thì username mới không trùng với username hiện có
    if (updateAccountDto.username && updateAccountDto.username !== account.username) {
      const existingAccount = await this.accountRepository.findOne({
        where: { username: updateAccountDto.username }
      });

      if (existingAccount) {
        throw new BadRequestException('Tên đăng nhập đã tồn tại');
      }

      account.username = updateAccountDto.username;
    }
    
    // Cập nhật mật khẩu nếu có
    if (updateAccountDto.password) {
      account.password = await bcrypt.hash(updateAccountDto.password, 10);
    }
    
    // Cập nhật roleId nếu có
    if (updateAccountDto.roleId) {
      account.role = { roleid: updateAccountDto.roleId } as any;
    }

    // Lưu vào database
    return this.accountRepository.save(account);
  }

  async remove(id: number): Promise<void> {
    // Kiểm tra tài khoản có tồn tại không
    const account = await this.findOne(id);
    
    // Xóa tài khoản từ database
    await this.accountRepository.remove(account);
  }

  async login(loginDto: LoginDto): Promise<{ account: Partial<Account>, token: string }> {
    try {
      // Tìm tài khoản theo username
      const account = await this.accountRepository.findOne({
        where: { username: loginDto.username },
        relations: ['role']
      });

      if (!account) {
        throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không đúng');
      }

      // So sánh mật khẩu
      const isPasswordValid = await bcrypt.compare(loginDto.password, account.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không đúng');
      }

      // Tạo token (Trong ứng dụng thực tế, bạn nên sử dụng JWT)
      const token = 'fake-jwt-token-' + Date.now();

      // Trả về thông tin tài khoản và token
      const accountWithoutPassword = {
        ...account,
        password: undefined
      };

      return {
        account: accountWithoutPassword,
        token
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Đăng nhập thất bại');
    }
  }

  async changePassword(id: number, changePasswordDto: ChangePasswordDto): Promise<void> {
    // Tìm tài khoản theo ID
    const account = await this.findOne(id);

    // Kiểm tra mật khẩu hiện tại
    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      account.password
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Mật khẩu hiện tại không đúng');
    }

    // Kiểm tra xác nhận mật khẩu
    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      throw new BadRequestException('Xác nhận mật khẩu không khớp');
    }

    // Mã hóa mật khẩu mới
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    // Cập nhật mật khẩu
    account.password = hashedPassword;
    
    // Lưu vào database
    await this.accountRepository.save(account);
  }
}
