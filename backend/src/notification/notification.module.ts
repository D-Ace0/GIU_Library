import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { MongooseModule } from "@nestjs/mongoose";
import { Notification, NotificationSchema } from "../schemas/notification.schema";
import { User, UserSchema } from "../schemas/user.schema";
import { Book, BookSchema } from "../schemas/book.schema";
import { JwtModule } from "@nestjs/jwt";
import { Borrowed, BorrowedSchema } from "../schemas/Borrowed.schema";
import {AuthModule} from "../auth/auth.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: User.name, schema: UserSchema },
      { name: Book.name, schema: BookSchema },
      { name: Borrowed.name, schema: BorrowedSchema },

    ]),AuthModule

  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService]
})
export class NotificationModule {}

