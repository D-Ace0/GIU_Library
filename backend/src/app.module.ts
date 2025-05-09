import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { BookModule } from './book/book.module';
import { NotificationModule } from './notification/notification.module';
import { RequestModule } from './requests/request.module';
import { BorrowedModule } from './borrowings/borrowed.module';
import { ReviewsModule } from './reviews/reviews.module';
@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtService,
    },
  ],
  imports: [
    AuthModule,
    MongooseModule.forRoot(
      'mongodb+srv://atamerfawzy:GIUPM@cluster0.mnyhh2g.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
    ),
    UsersModule,
    BookModule,
    NotificationModule,
    RequestModule,
    BorrowedModule,
    ReviewsModule,
  ],
})
export class AppModule {}
