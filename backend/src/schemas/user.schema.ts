import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";


export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
  }

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({enum: UserRole, default: UserRole.USER})
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
