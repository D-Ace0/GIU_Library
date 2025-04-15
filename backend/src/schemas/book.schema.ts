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
  @Prop({required:false}) image_url: string;
  @Prop() category: string;
  @Prop() stock: number;
  @Prop() location: string;
  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Borrowed',required:false }) borrowers: any[];
  @Prop({required:false}) isOutOfStock: boolean;
  @Prop({required:false}) nearestReturnDate?: Date;
  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Review',required:false }) recentReviews: any[];

}

export const BookSchema = SchemaFactory.createForClass(Book);