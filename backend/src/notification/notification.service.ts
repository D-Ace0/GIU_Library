import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Notification } from '../schemas/notification.schema';
import { Model } from 'mongoose';
import { Borrowed } from 'src/schemas/Borrowed.schema';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name) 
    private notificationModel: Model<Notification>,
    @InjectModel(Borrowed.name) 
    private borrowedModel: Model<Borrowed>,
    @InjectModel(User.name) 
    private userModel: Model<User>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto) {
    const { borrowId, body, from } = createNotificationDto;
  
    if (!borrowId) {
      throw new Error('borrowId is required to find the borrowed record.');
    }
  
    // Find the borrowed entry
    const borrowed = await this.borrowedModel.findById(borrowId);
    if (!borrowed) {
      throw new Error('Borrowed record not found.');
    }
  
    // Create the notification without borrowId
    const createdNotification = new this.notificationModel({
      to: borrowed.userId,
      from:from,
      body:body,
      bookTitle:borrowed.bookTitle,
      createdAt: new Date(),
      read: false,
    });
  
    return createdNotification.save();
  }
  
  async systemNotification(){
    // Step 1: Get the "System" user
  const systemUser = await this.userModel.findOne({ username: 'System' });
  if (!systemUser) {
    throw new Error('System user not found');
  }

  const systemUserId = systemUser._id;

  // Step 2: Get today's date range
  const now = new Date();
  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  const todayEnd = new Date(now.setHours(23, 59, 59, 999));

  // Step 3: Find borrowed entries due today and not returned
  const dueBorrowedEntries = await this.borrowedModel.find({
    returnDate: { $gte: todayStart, $lte: todayEnd },
    returned: false,
  });

  // Step 4: Create notifications for each due entry
  const notifications = await Promise.all(
    dueBorrowedEntries.map((entry) => {
      const notification = new this.notificationModel({
        to: entry.userId,
        from: systemUserId,
        body: `Please return "${entry.bookTitle}" today`,
        bookTitle: entry.bookTitle,
        createdAt: new Date(),
        read: false,
      });
      return notification.save();
    })
  );

  return notifications;
  }


  async findAll(userId: string) {
   const notification = await this.notificationModel.find({ to: userId }).sort({ createdAt: -1 }).exec();
   console.log(notification);

    return notification
  }

  

  

  async remove(id: string) {
    return  this.notificationModel.findByIdAndDelete(id).exec();
  }

  async markAsRead(id: string) {
    return this.notificationModel.findByIdAndUpdate(
      id, 
      { read: true }, 
      { new: true }
    ).exec();
  }
}
