import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';


@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.create(createNotificationDto);
  }

  @Post("System")
async  systemNotification() {
    return this.notificationService.systemNotification();
  }

  @Get(":userId")
  findAll(@Param('userId') userId: string) {
    return this.notificationService.findAll(userId);
  }

  

  

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationService.remove(id);
  }

  @Patch(':id/mark-as-read')
  markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }
}

