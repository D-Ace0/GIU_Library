import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BorrowedController } from './borrowed.controller';
import { BorrowedService } from './borrowed.service';
import { Borrowed, BorrowedSchema } from '../schemas/Borrowed.schema';
import { Book, BookSchema } from '../schemas/book.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { Request, RequestSchema } from '../schemas/request.schema';
import { AuthModule } from 'src/auth/auth.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Borrowed.name, schema: BorrowedSchema },
      { name: Book.name, schema: BookSchema },
      { name: User.name, schema: UserSchema },
      { name: Request.name, schema: RequestSchema },
    ]),AuthModule,
  ],
  controllers: [BorrowedController],
  providers: [BorrowedService],
  exports: [BorrowedService],
})
export class BorrowedModule {}