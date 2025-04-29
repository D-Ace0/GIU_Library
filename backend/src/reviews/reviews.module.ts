import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemas/user.schema';
import { BookSchema } from '../schemas/book.schema';
import { AuthModule } from '../auth/auth.module';
import { Review, ReviewSchema } from '../schemas/review.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: 'Book', schema: BookSchema },
      { name: Review.name, schema: ReviewSchema },
    ]),
    AuthModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
