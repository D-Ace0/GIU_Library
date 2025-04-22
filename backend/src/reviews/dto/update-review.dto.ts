import { PartialType } from '@nestjs/mapped-types';
import { CreateReviewDto } from './create-review.dto';
import {IsNotEmpty, IsOptional} from "class-validator";

export class UpdateReviewDto extends PartialType(CreateReviewDto) {
    @IsOptional()
    reviewText: string;
    @IsOptional()
    rating: number;
}
