import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createAccountDto: CreateAccountDto) {
    const data = await this.accountService.create(createAccountDto);
    
    // Không trả về mật khẩu trong response
    const { password, ...accountWithoutPassword } = data;
    
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Tạo tài khoản thành công',
      data: accountWithoutPassword
    };
  }

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('roleId') roleId?: number,
    @Query('sortBy') sortBy: string = 'username',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC'
  ) {
    const [accounts, total] = await this.accountService.findAllWithPagination({
      page,
      limit,
      search,
      roleId,
      sortBy,
      sortOrder
    });

    // Loại bỏ mật khẩu khỏi response
    const accountsWithoutPassword = accounts.map(account => {
      const { password, ...accountWithoutPassword } = account;
      return accountWithoutPassword;
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách tài khoản thành công',
      data: accountsWithoutPassword,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const account = await this.accountService.findOne(+id);
    
    // Không trả về mật khẩu trong response
    const { password, ...accountWithoutPassword } = account;
    
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy thông tin tài khoản thành công',
      data: accountWithoutPassword
    };
  }

  @Get('by-username/:username')
  async findByUsername(@Param('username') username: string) {
    const account = await this.accountService.findByUsername(username);
    
    // Không trả về mật khẩu trong response
    const { password, ...accountWithoutPassword } = account;
    
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy thông tin tài khoản thành công',
      data: accountWithoutPassword
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateAccountDto: UpdateAccountDto) {
    const account = await this.accountService.update(+id, updateAccountDto);
    
    // Không trả về mật khẩu trong response
    const { password, ...accountWithoutPassword } = account;
    
    return {
      statusCode: HttpStatus.OK,
      message: 'Cập nhật tài khoản thành công',
      data: accountWithoutPassword
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.accountService.remove(+id);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const result = await this.accountService.login(loginDto);
    
    return {
      statusCode: HttpStatus.OK,
      message: 'Đăng nhập thành công',
      data: result
    };
  }

  @Post(':id/change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    await this.accountService.changePassword(+id, changePasswordDto);
    
    return {
      statusCode: HttpStatus.OK,
      message: 'Đổi mật khẩu thành công'
    };
  }
}
