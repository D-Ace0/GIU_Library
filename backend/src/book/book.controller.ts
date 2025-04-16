import {Controller, Get, Post, Body, Patch, Param, Delete,UseGuards } from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import {AuthenticationGuard} from "../guards/authentication.guard";
import{AuthorizationGuard} from "../guards/authorization.guard";
import {Roles} from "../decorators/roles.decorator";


@Controller('book')
//@UseGuards(AuthorizationGuard,AuthenticationGuard)
export class BookController {
  constructor(private readonly bookService: BookService) {}

  //add a book
  @Post()
  //@Roles(['admin'])
 async create(@Body() createBookDto: CreateBookDto) {
    return this.bookService.create(createBookDto);
  }
  //get all books
  @Get()
  //@Roles(['admin', 'user'])
  async findAll() {
    return this.bookService.findAll();
  }

  @Get(':bookTitle')
  //@Roles(['admin', 'user'])
  //no need for exceptions as this will not be implemented for search functionalitly
  async findOne(@Param('bookTitle') bookTitle: string) {
    return this.bookService.findOne(bookTitle);

  }

  @Patch(':bookTitle')
  //@Roles(['admin']
  async update(@Param('bookTitle') bookTitle: string, @Body() updateBookDto: UpdateBookDto) {
    return this.bookService.update(bookTitle, updateBookDto);
  }

  @Delete(':bookTitle')
  //@Roles(['admin']
  async remove(@Param('bookTitle') bookTitle: string) {
    return this.bookService.remove(bookTitle);
  }
  @Get('search/:title')
  //@Roles(['admin', 'user'])
  async Search(@Param('title') title: string) {
      return this.bookService.Search(title);
  }


}
