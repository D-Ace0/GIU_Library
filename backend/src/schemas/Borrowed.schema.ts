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
    @Prop() borrowedAt: Date;
    @Prop() returnDate: Date;
    @Prop() returned: boolean;
    @Prop( {required: false} ) returnedAt?: Date;
    @Prop({enum:STATUS}) status: STATUS;

}

export const BorrowedSchema = SchemaFactory.createForClass(Borrowed);