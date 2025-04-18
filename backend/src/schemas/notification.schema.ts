import { Schema, Prop, SchemaFactory, PropOptions } from '@nestjs/mongoose';
import mongoose, { Date, Document, Types } from 'mongoose'
import {User} from "./user.schema";
import {Book} from "./book.schema";
export type NotificationDocument = Notification & Document;
export enum NotificationType {
    DUEREMINDER= "dueReminder",
    WARNING="warning",
    INFO="info"
}
@Schema()
export class Notification extends Document {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' }) to: any;
    @Prop({required:false}) from: string;
    @Prop() body: string;
    @Prop() bookTitle: string;
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Borrowed' }) borrowId?: any;
    @Prop({type:Date}) createdAt: Date;
    @Prop() read: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

