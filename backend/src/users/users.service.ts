import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  [x: string]: any;
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findAll() {
    return await this.userModel.find().select('-password -__v').exec();
  }

  async findOne(id: string) {
    const user = await this.userModel
      .findById(id)
      .select('-password -__v')
      .exec();
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password -__v')
      .exec();
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async remove(id: string) {
    const user = await this.userModel
      .findByIdAndDelete(id)
      .select('-password -__v')
      .exec();
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
  // get saved books
  async getSavedBooks(id: string) {
    const user = await this.userModel
      .findById(id)
      .select('-password -__v')
      .exec();
    if (!user) {
      throw new Error('User not found');
    }
    return user.savedBooks;
  }
  // get user reviews
  async getReviews(id: string) {
    const user = await this.userModel
      .findById(id)
      .select('-password -__v')
      .exec();
    if (!user) {
      throw new Error('User not found');
    }
    return user.recentReviews;
  }
  //update user image
  async updateImage(id: string, image_url: string) {
    const user = await this.userModel
      .findByIdAndUpdate(id, { image_url }, { new: true })
      .select('-password -__v')
      .exec();
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}
