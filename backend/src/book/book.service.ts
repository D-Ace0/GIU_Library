import {BadRequestException, ConflictException, Injectable} from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import {Book, BookDocument} from "../schemas/book.schema";
import { Model } from 'mongoose';
import {InjectModel} from "@nestjs/mongoose";
import {User} from "../schemas/user.schema";


@Injectable()
export class BookService {
  constructor(@InjectModel(Book.name) private bookModel: Model<BookDocument>,
    @InjectModel(User.name) private userModel: Model<User>,)
  {}

  async create(createBookDto: CreateBookDto) {
    //first check if exists
    const { bookTitle, author } = createBookDto;
    const exsit=await this.bookModel.findOne({bookTitle:bookTitle, author:author});
    if (exsit){
      throw new ConflictException('Book already exists');

    }
    const newBook = new this.bookModel(createBookDto);
    return newBook.save();
  }

  findAll() {
    return `This action returns all book`;
  }

  findOne(id: number) {
    return `This action returns a #${id} book`;
  }

  update(id: number, updateBookDto: UpdateBookDto) {
    return `This action updates a #${id} book`;
  }

  remove(id: number) {
    return `This action removes a #${id} book`;
  }
}
