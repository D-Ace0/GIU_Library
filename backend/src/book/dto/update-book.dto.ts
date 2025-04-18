import { PartialType } from '@nestjs/mapped-types';
import { CreateBookDto } from './create-book.dto';
import {IsNumber, IsOptional, IsString} from "class-validator";

export class UpdateBookDto extends PartialType(CreateBookDto) {
    @IsOptional()
    @IsString()
    bookTitle: string;

    @IsOptional()
    @IsString()
    author: string;

    @IsOptional()
    @IsString()
    summary: string;

    @IsOptional()
    @IsString()
    publisher: string;

    @IsOptional()
    @IsString()
    language: string;

    @IsOptional()
    @IsNumber()
    pageCount: number;

    @IsOptional()
    @IsString()
    image_url?: string;

    @IsOptional()
    @IsString()
    category: string;

    @IsOptional()
    @IsNumber()
    stock: number;

    @IsOptional()
    @IsString()
    location: string;
}
