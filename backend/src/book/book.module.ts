import { Module } from '@nestjs/common';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import{User,UserSchema} from "../schemas/user.schema";
import {BookSchema} from "../schemas/book.schema";
import {MongooseModule} from "@nestjs/mongoose";
import {JwtModule} from "@nestjs/jwt";


@Module({
  imports: [MongooseModule.forFeature([{ name:User.name,schema:UserSchema},
    {name:'Book',schema:BookSchema},]),JwtModule.register({
    secret: process.env.JWT_SECRET,
    signOptions: { expiresIn: '1h' },
  })],
  controllers: [BookController],
  providers: [BookService],
})
export class BookModule {}
