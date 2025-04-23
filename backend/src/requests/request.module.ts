import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RequestController } from './request.controller';
import { RequestService } from './request.service';
import { Request, RequestSchema } from '../schemas/request.schema';
import { Book, BookSchema } from '../schemas/book.schema';
import { User, UserSchema } from '../schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Request.name, schema: RequestSchema },
      { name: Book.name, schema: BookSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [RequestController],
  providers: [RequestService],
  exports: [RequestService],
})
export class RequestModule {}