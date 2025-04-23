import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req, Put } from '@nestjs/common';
import { RequestService } from './request.service';
import { Request } from '../schemas/request.schema';
import { AuthenticationGuard } from '../guards/authentication.guard';
import { AuthorizationGuard } from '../guards/authorization.guard';
import { Roles } from '../decorators/roles.decorator';

@Controller('requests')
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @Post()
  @UseGuards(AuthenticationGuard)
  async createRequest(
    @Body() requestData: { userId: string; bookId: string },
  ): Promise<Request> {
    return this.requestService.createRequest(requestData.userId, requestData.bookId);
  }

  @Get()
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  // @Roles('admin')
  async getAllRequests(): Promise<Request[]> {
    return this.requestService.getAllRequests();
  }

  @Get('pending')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  // @Roles('admin')
  async getPendingRequests(): Promise<Request[]> {
    return this.requestService.getPendingRequests();
  }

  @Get('user/:userId')
  @UseGuards(AuthenticationGuard)
  async getRequestsByUser(@Param('userId') userId: string): Promise<Request[]> {
    return this.requestService.getRequestsByUser(userId);
  }

  @Put('approve/:id')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  // @Roles('admin')
  async approveRequest(@Param('id') id: string): Promise<Request> {
    return this.requestService.approveRequest(id);
  }

  @Delete(':id')
  @UseGuards(AuthenticationGuard)
  async deleteRequest(@Param('id') id: string): Promise<Request> {
    return this.requestService.deleteRequest(id);
  }

  @Delete('book-title/:bookTitle')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  // @Roles('admin')
  async deleteRequestByBookTitle(@Param('bookTitle') bookTitle: string): Promise<{ message: string }> {
    await this.requestService.deleteRequestByBookTitle(bookTitle);
    return { message: `All requests for book titled "${bookTitle}" have been deleted` };
  }

  @Get(':id')
  @UseGuards(AuthenticationGuard)
  async getRequestById(@Param('id') id: string): Promise<Request> {
    return this.requestService.getRequestById(id);
  }
}