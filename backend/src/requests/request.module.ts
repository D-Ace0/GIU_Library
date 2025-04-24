import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RequestController } from './request.controller';
import { RequestService } from './request.service';
import { Request, RequestSchema } from '../schemas/request.schema';
import { Book, BookSchema } from '../schemas/book.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { AuthModule } from 'src/auth/auth.module';
import { BorrowedSchema , Borrowed} from 'src/schemas/Borrowed.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Request.name, schema: RequestSchema },
      { name: Book.name, schema: BookSchema },
      { name: User.name, schema: UserSchema },
      { name: Borrowed.name, schema: BorrowedSchema}
    ]),AuthModule
  ],
  controllers: [RequestController],
  providers: [RequestService],
  exports: [RequestService],
})
export class RequestModule {}