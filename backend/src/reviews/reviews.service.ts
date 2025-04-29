import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Book, BookDocument } from '../schemas/book.schema';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { Review } from '../schemas/review.schema';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Book.name) private bookModel: Model<BookDocument>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Review.name) private reviewModel: Model<Review>,
  ) {}
  async create(createReviewDto: CreateReviewDto, id: string) {
    const name = await this.userModel.findById(id).select('username').exec();
    const newReview = new this.reviewModel({
      userId: id,
      Username: name?.username, // match casing with schema
      BookTitle: createReviewDto.BookTitle,
      rating: createReviewDto.rating,
      reviewText: createReviewDto.reviewText,
      createdAt: new Date(),
    });

    await newReview.save();

    await this.bookModel.findOneAndUpdate(
      { bookTitle: createReviewDto.BookTitle },
      { $push: { recentReviews: newReview._id } },
    );
    await this.userModel.findOneAndUpdate(
      { _id: id },
      { $push: { recentReviews: newReview._id } },
    );

    return newReview;
  }

  async findAll(BookTitle: string) {
    const bookReview = await this.bookModel
      .findOne({ bookTitle: BookTitle })
      .select('recentReviews')
      .exec();
    if (!bookReview) {
      throw new Error('Book not found');
    }

    const reviewIds = bookReview.recentReviews;
    if (!reviewIds || reviewIds.length === 0) {
      return []; // No reviews to return
    }

    const reviewsArray: {
      BookTitle: string;
      Username: string;
      reviewText: string;
      rating: number;
    }[] = [];

    for (const reviewId of reviewIds) {
      const review = await this.reviewModel.findById(reviewId);
      if (review) {
        const message = {
          BookTitle: review.BookTitle,
          Username: review.Username,
          reviewText: review.reviewText,
          rating: review.rating,
        };
        reviewsArray.push(message);
      }
    }

    return reviewsArray;
  }

  async update(id: string, updateReviewDto: UpdateReviewDto) {
    const updatedReview = await this.reviewModel.findOneAndUpdate(
      { _id: id },
      { $set: updateReviewDto },
      { new: true },
    );
    return updatedReview;
  }

  async remove(id: string) {
    const review = await this.reviewModel.findById(id);

    await this.reviewModel.findByIdAndDelete(id);

    // 2. Remove review ID from Book.recentReviews
    await this.bookModel.findOneAndUpdate(
      { bookTitle: review?.BookTitle },
      { $pull: { recentReviews: review?._id } },
    );

    // 3. Remove review ID from User.recentReviews (if you have this field)
    await this.userModel.findByIdAndUpdate(review?.userId, {
      $pull: { recentReviews: review?._id },
    });

    return { message: 'Review deleted successfully' };
  }

  async findUserReviews(id: string) {
    // Directly query the reviews collection for reviews with the matching userId
    const reviews = (await this.reviewModel
      .find({ userId: id })
      .exec()) as Review[];

    if (!reviews || reviews.length === 0) {
      return [];
    }

    return reviews.map((review) => ({
      _id: (review._id as any).toString(),
      BookTitle: review.BookTitle,
      Username: review.Username,
      reviewText: review.reviewText,
      rating: review.rating,
      createdAt: review.createdAt,
    }));
  }
}
