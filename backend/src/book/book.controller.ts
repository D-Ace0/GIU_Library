import {Controller, Get, Post, Body, Patch, Param, Delete,UseGuards } from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import {AuthenticationGuard} from "../guards/authentication.guard";
import{AuthorizationGuard} from "../guards/authorization.guard";
import {Roles} from "../decorators/roles.decorator";


@Controller('book')
@UseGuards(AuthorizationGuard,AuthenticationGuard)
export class BookController {
  constructor(private readonly bookService: BookService) {}

  //add a book
  @Post()
  @Roles(['admin'])
 async create(@Body() createBookDto: CreateBookDto) {
    return this.bookService.create(createBookDto);
  }
  //get all books
  @Get()
  findAll() {
    return this.bookService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.bookService.update(+id, updateBookDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookService.remove(+id);
  }
}
