import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import {Review} from "./review.schema";
import {Borrowed} from "./Borrowed.schema";
import{Book} from "./book.schema";

export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
  }

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: false })
  major?: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({enum: UserRole, default: UserRole.USER})
  role: string;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Book' }) 
  savedBooks: any[];

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Borrowed' })
   borrowedBooks: any[];

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Review' }) 
  recentReviews: any[];

  @Prop() 
  image_url: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
