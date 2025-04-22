import {IsNotEmpty} from "class-validator";

export class CreateReviewDto {
    @IsNotEmpty()
    BookTitle: string;
    @IsNotEmpty()
    reviewText: string;
    @IsNotEmpty()
    rating: number;
}
