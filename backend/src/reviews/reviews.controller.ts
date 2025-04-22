import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post(":id")
  async create(@Body() createReviewDto: CreateReviewDto,@Param('id')id:string) {
    return this.reviewsService.create(createReviewDto,id);
  }

  @Get(":BookTitle")
  async findAll(@Param('BookTitle') BookTitle: string) {
    return this.reviewsService.findAll(BookTitle);
  }

  @Get('user/:id')
  async findUserReviews(@Param('id') id: string) {
    return this.reviewsService.findUserReviews(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewsService.update(id, updateReviewDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.reviewsService.remove(id);
  }
}
