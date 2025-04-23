import { Controller, Get, Post, Body, Param, Delete, UseGuards, Put } from '@nestjs/common';
import { BorrowedService } from './borrowed.service';
import { Borrowed } from '../schemas/Borrowed.schema';
import { AuthenticationGuard } from '../guards/authentication.guard';
import { AuthorizationGuard } from '../guards/authorization.guard';
import { Roles } from '../decorators/roles.decorator';

@Controller('borrowed')
export class BorrowedController {
  constructor(private readonly borrowedService: BorrowedService) {}

  @Post('from-request/:requestId')
  @UseGuards(AuthenticationGuard)
//   @Roles('admin')
  async createBorrowedFromRequest(
    @Param('requestId') requestId: string,
    @Body() data: { returnDays?: number },
  ): Promise<Borrowed> {
    return this.borrowedService.createBorrowedFromRequest(requestId, data.returnDays);
  }

  @Get()
  @UseGuards(AuthenticationGuard)
//   @Roles('admin')
  async getAllBorrowed(): Promise<Borrowed[]> {
    return this.borrowedService.getAllBorrowed();
  }

  @Get('active')
  @UseGuards(AuthenticationGuard)
//   @Roles('admin')
  async getActiveBorrowings(): Promise<Borrowed[]> {
    return this.borrowedService.getActiveBorrowings();
  }

  @Get('overdue')
  @UseGuards(AuthenticationGuard)
//   @Roles('admin')
  async getOverdueBorrowings(): Promise<Borrowed[]> {
    return this.borrowedService.getOverdueBorrowings();
  }

  @Get('user/:userId')
  @UseGuards(AuthenticationGuard)
  async getUserBorrowings(@Param('userId') userId: string): Promise<Borrowed[]> {
    return this.borrowedService.getUserBorrowings(userId);
  }

  @Put('return/:id')
  @UseGuards(AuthenticationGuard)
  async returnBook(@Param('id') id: string): Promise<Borrowed> {
    return this.borrowedService.returnBook(id);
  }

  @Delete(':id')
  @UseGuards(AuthenticationGuard)
  async deleteBorrowed(@Param('id') id: string): Promise<Borrowed> {
    return this.borrowedService.deleteBorrowed(id);
  }

  @Get(':id')
  @UseGuards(AuthenticationGuard)
  async getBorrowedById(@Param('id') id: string): Promise<Borrowed> {
    return this.borrowedService.getBorrowedById(id);
  }
}