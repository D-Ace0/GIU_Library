import {Controller, Get, Post, Body, Patch, Param, Delete,UseGuards } from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import {AuthenticationGuard} from "../guards/authentication.guard";
import{AuthorizationGuard} from "../guards/authorization.guard";
import {Roles} from "../decorators/roles.decorator";


@Controller('book')
@UseGuards(AuthenticationGuard,AuthorizationGuard)
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
    @Roles(['admin', 'user'])
    async findAll() {
        return this.bookService.findAll();
    }

    @Get(':bookTitle')
    @Roles(['admin', 'user'])
    //no need for exceptions as this will not be implemented for search functionalitly
    async findOne(@Param('bookTitle') bookTitle: string) {
        return this.bookService.findOne(bookTitle);

    }

    @Patch(':bookTitle')
    @Roles(['admin'])
    async update(@Param('bookTitle') bookTitle: string, @Body() updateBookDto: UpdateBookDto) {
        return this.bookService.update(bookTitle, updateBookDto);
    }

    @Delete(':bookTitle')
    @Roles(['admin'])
    async remove(@Param('bookTitle') bookTitle: string) {
        return this.bookService.remove(bookTitle);
    }
    @Get('search/:title')
    @Roles(['admin', 'user'])
    async Search(@Param('title') title: string) {
        return this.bookService.Search(title);
    }

    @Get('author/:author')
    @Roles(['admin', 'user'])
    async Author(@Param('author') author: string) {
        return this.bookService.Author(author);
    }

    @Get('language/:language')
    @Roles(['admin', 'user'])
    async Language(@Param('language') language: string) {
        return this.bookService.Language(language);
    }

    @Get('location/:location')
    @Roles(['admin', 'user'])
    async Location(@Param('location') location: string) {
        return this.bookService.Location(location);
    }
    @Get('category/:category')
    @Roles(['admin', 'user'])
    async Category(@Param('category') category: string) {
        return this.bookService.Category(category);
    }
    @Get('publisher/:publisher')
    @Roles(['admin', 'user'])
    async Publisher(@Param('publisher') publisher: string) {

        return this.bookService.Publisher(publisher);
    }


    @Patch(':userId/save/:bookId')
    @Roles(['user'])
    async saveBook(
        @Param('userId') userId: string,
        @Param('bookId') bookId: string
    ) {
        return this.bookService.saveBook(userId, bookId);
    }

    @Patch(':userId/unsave/:bookId')
    @Roles(['user'])
    async unsaveBook(
        @Param('userId') userId: string,
        @Param('bookId') bookId: string
    ) {
        return this.bookService.unsaveBook(userId, bookId);
    }
    @Get('Sorting/A-Z')
    @Roles(['admin', 'user'])
    async sortAZ() {
        return this.bookService.sortAZ();
    }
    @Get('Sorting/Z-A')
    @Roles(['admin', 'user'])
    async sortZA() {
        return this.bookService.sortZA();
    }
    
}

