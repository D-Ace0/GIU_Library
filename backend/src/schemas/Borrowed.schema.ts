import { Schema, Prop, SchemaFactory, PropOptions } from '@nestjs/mongoose';
import mongoose, { Date, Document, Types } from 'mongoose'
import {User} from "./user.schema";
import {Book} from "./book.schema";


export type BorrowedDocument = Borrowed & Document
export enum STATUS{
    ACTIVE='active',
    OVERDUE='overdue',
    RETURNED='returned',
}
@Schema()
export class Borrowed extends Document {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }) bookId: any;
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' }) userId: any;
    @Prop({type:Date,default:Date.now}) borrowedAt: Date;
    @Prop({type:Date}) returnDate: Date;
    @Prop() returned: boolean;
    @Prop( {type:Date,required: false} ) returnedAt?: Date;
    @Prop({enum:STATUS}) status: STATUS;

}

export const BorrowedSchema = SchemaFactory.createForClass(Borrowed);