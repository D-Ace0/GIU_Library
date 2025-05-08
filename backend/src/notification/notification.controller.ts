import {Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import {AuthenticationGuard} from "../guards/authentication.guard";
import {AuthorizationGuard} from "../guards/authorization.guard";
import {Roles} from "../decorators/roles.decorator";


@Controller('notifications')
@UseGuards(AuthenticationGuard,AuthorizationGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @Roles(['admin'])
  async create(@Body() createNotificationDto: CreateNotificationDto) {
   
    return this.notificationService.create(createNotificationDto);
  }


  @Post("System")
  @Roles(['admin'])
  async systemNotification() {
    
    return this.notificationService.systemNotification();
  }

  @Get(":userId")
  @Roles(['user'])
  findAll(@Param('userId') userId: string) {
    return this.notificationService.findAll(userId);
  }


  @Delete(':id')
  @Roles(['user'])
  remove(@Param('id') id: string) {
    return this.notificationService.remove(id);
  }

  @Patch(':id/mark-as-read')
  @Roles(['user'])
  markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }
}

