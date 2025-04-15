import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { User } from "./user.schema";
import mongoose, { Mongoose } from "mongoose";




@Schema()
export class Book {
  @Prop({ required: true, unique: true })
  title: string;

  @Prop({ required: true })
  nOfCopies: number;

  @Prop({default: [], type: [mongoose.Schema.Types.ObjectId], ref: () => User})
  userIds: User[];

}

export const BookSchema = SchemaFactory.createForClass(Book);