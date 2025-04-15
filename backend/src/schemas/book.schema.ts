import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { User } from "./user.schema";
import mongoose, {Document, Mongoose} from "mongoose";
import {Borrowed} from "./Borrowed.schema";


export type BookDocument = Book & Document

@Schema()
export class Book {
  @Prop() bookTitle: string;
  @Prop() author: string;
  @Prop() summary: string;
  @Prop() publisher: string;
  @Prop() language: string;
  @Prop() pageCount: number;
  @Prop() image_url: string;
  @Prop() stock: number;
  @Prop() location: string;
  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Borrowed' }) borrowers: any[];
  @Prop() isOutOfStock: boolean;
  @Prop() nearestReturnDate?: Date;
  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Review' }) recentReviews: any[];

}

export const BookSchema = SchemaFactory.createForClass(Book);