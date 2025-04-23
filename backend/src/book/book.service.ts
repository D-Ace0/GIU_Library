import {BadRequestException, ConflictException, Injectable, NotFoundException} from '@nestjs/common';
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

  async findAll() {
    return await this.bookModel.find();
  }

  async findOne(bookTitle: string) {

    return await this.bookModel.findOne({bookTitle}).exec();
  }

  async update(bookTitle: string, updateBookDto: UpdateBookDto) {
    const updatedBook=await this.bookModel.findOneAndUpdate(
        {bookTitle},{$set:updateBookDto},{new: true});

    if(!updateBookDto){
      throw new NotFoundException(`"${bookTitle}" not found`);

    }
    return updatedBook;
  }

  async remove(bookTitle: string) {
    const result=await this.bookModel.deleteOne({bookTitle})
    if(result.deletedCount===0){
      throw new NotFoundException(`"${bookTitle}" not found`);
    }

    return{message:`"${bookTitle}" has been deleted successfully`};
  }

  async Search(title: string) {
    return await this.bookModel.find({bookTitle:{$regex:title,$options:'i'}});
  }


  async Author(author: string) {
    return await this.bookModel.find({author:author});
  }

  async Language(language: string) {
    return await this.bookModel.find({language:language});
  }

  async Location(location: string) {
    return await this.bookModel.find({location:location});
  }

  async Category(category: string) {
    return await this.bookModel.find({category:category});
  }

  async Publisher (publisher: string) {
    return await this.bookModel.find({publisher:publisher});
  }
  async saveBook(userId: string, bookId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new Error('User not found');

    if (user.savedBooks?.includes(bookId)) {
      return { message: 'Book already saved' };
    }

    await this.userModel.findByIdAndUpdate(
        userId,
        { $push: { savedBooks: bookId } },
        { new: true }
    );

    return { message: 'Book saved successfully' };
  }

  async unsaveBook(userId: string, bookId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new Error('User not found');

    if (!user.savedBooks?.includes(bookId)) {
      return { message: 'Book was not saved' };
    }

    await this.userModel.findByIdAndUpdate(
        userId,
        { $pull: { savedBooks: bookId } },
        { new: true }
    );

    return { message: 'Book removed from saved list' };
  }
}
