import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ValidationPipe, UsePipes, ParseIntPipe } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('invoice')
@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiResponse({ status: 201, description: 'Invoice created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoiceService.create(createInvoiceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all invoices with optional pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Returns all invoices' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Invoice status' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'roomId', required: false, type: Number, description: 'Room ID' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Sort by field' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort order' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('roomId') roomId?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    if (page || limit || search || status || startDate || endDate || roomId || sortBy || sortOrder) {
      return this.invoiceService.findAllWithPagination({
        page: page ? +page : 1,
        limit: limit ? +limit : 10,
        search,
        status,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        roomId: roomId ? +roomId : undefined,
        sortBy: sortBy || 'invoiceid',
        sortOrder: sortOrder || 'DESC',
      });
    }
    
    return this.invoiceService.findAll();
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get invoice statistics' })
  @ApiResponse({ status: 200, description: 'Returns invoice statistics' })
  getInvoiceStatistics() {
    return this.invoiceService.getInvoiceStatistics();
  }

  @Get('by-room/:roomId')
  @ApiOperation({ summary: 'Get invoices by room ID' })
  @ApiResponse({ status: 200, description: 'Returns invoices for the specified room' })
  @ApiParam({ name: 'roomId', type: Number, description: 'Room ID' })
  findByRoom(@Param('roomId', ParseIntPipe) roomId: number) {
    return this.invoiceService.findByRoom(roomId);
  }

  @Get('by-status/:status')
  @ApiOperation({ summary: 'Get invoices by status' })
  @ApiResponse({ status: 200, description: 'Returns invoices with the specified status' })
  @ApiParam({ name: 'status', type: String, description: 'Invoice status' })
  findByStatus(@Param('status') status: string) {
    return this.invoiceService.findByStatus(status);
  }

  @Get(':id/calculate-total')
  @ApiOperation({ summary: 'Calculate total amount for an invoice' })
  @ApiResponse({ status: 200, description: 'Returns the calculated total amount' })
  @ApiParam({ name: 'id', type: Number, description: 'Invoice ID' })
  calculateTotal(@Param('id', ParseIntPipe) id: number) {
    return this.invoiceService.calculateTotalByInvoiceId(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiResponse({ status: 200, description: 'Returns the invoice with the specified ID' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiParam({ name: 'id', type: Number, description: 'Invoice ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.invoiceService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Update an invoice' })
  @ApiResponse({ status: 200, description: 'Invoice updated successfully' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiParam({ name: 'id', type: Number, description: 'Invoice ID' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateInvoiceDto: UpdateInvoiceDto) {
    return this.invoiceService.update(id, updateInvoiceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an invoice' })
  @ApiResponse({ status: 200, description: 'Invoice deleted successfully' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiParam({ name: 'id', type: Number, description: 'Invoice ID' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.invoiceService.remove(id);
    return {
      statusCode: 200,
      message: `Đã xóa hóa đơn có ID ${id} thành công`,
    };
  }
}
