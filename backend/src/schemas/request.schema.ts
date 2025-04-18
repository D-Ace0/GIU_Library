import { Schema, Prop, SchemaFactory, PropOptions } from '@nestjs/mongoose';
import mongoose, { Date, Document, Types } from 'mongoose'
import {User} from "./user.schema";
import {Book} from "./book.schema";

export type requestDocument = Request & Document;
export enum STATUS{
    PENDING='pending',
    APPROVED='approved',

}

@Schema()
export class Request extends Document {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }) bookId: any;
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' }) userId: any;
    @Prop({enum:STATUS}) status:STATUS;
    @Prop() createdAt: Date;
    @Prop({required:false}) resolvedAt?: Date;
}

export const RequestSchema = SchemaFactory.createForClass(Request);
