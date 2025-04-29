import { Schema, Prop, SchemaFactory, PropOptions } from '@nestjs/mongoose';
import mongoose, { Date, Document, Types } from 'mongoose';
import { User } from './user.schema';
import { Book } from './book.schema';
export type UserDocument = Review & Document;
@Schema()
export class Review extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => User }) userId: any;
  @Prop() BookTitle: string;
  @Prop() Username: string;
  @Prop() rating: number;
  @Prop() reviewText: string;
  @Prop({ type: Date }) createdAt: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
