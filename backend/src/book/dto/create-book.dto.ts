import {
    IsString,
    IsOptional,
    IsNumber,
    IsBoolean,
    IsArray,
    IsMongoId,
    IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
export class CreateBookDto {
    @IsString()
    bookTitle: string;

    @IsString()
    author: string;

    @IsString()
    summary: string;

    @IsString()
    publisher: string;

    @IsString()
    language: string;

    @IsNumber()
    pageCount: number;

    @IsOptional()
    @IsString()
    image_url?: string;

    @IsString()
    category: string;

    @IsNumber()
    stock: number;

    @IsString()
    location: string;



}


