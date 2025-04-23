import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request, STATUS } from '../schemas/request.schema';
import { Book } from '../schemas/book.schema';
import { User } from '../schemas/user.schema';

@Injectable()
export class RequestService {
  constructor(
    @InjectModel(Request.name) private requestModel: Model<Request>,
    @InjectModel(Book.name) private bookModel: Model<Book>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async createRequest(userId: string, bookId: string): Promise<Request> {
    // Check if book exists and is in stock
    const book = await this.bookModel.findById(bookId);
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    
    if (book.stock <= 0) {
      throw new BadRequestException('Book is out of stock');
    }
    
    // Check if user exists
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Check if request already exists
    const existingRequest = await this.requestModel.findOne({
      userId,
      bookId,
      status: STATUS.PENDING,
    });
    
    if (existingRequest) {
      throw new BadRequestException('Request already exists for this book');
    }
    
    // Create new request
    const newRequest = new this.requestModel({
      userId,
      bookId,
      status: STATUS.PENDING,
      createdAt: new Date(),
    });
    
    return newRequest.save();
  }
  
  async getAllRequests(): Promise<Request[]> {
    return this.requestModel.find()
      .populate('userId', 'name email')
      .populate('bookId', 'bookTitle author')
      .exec();
  }
  
  async getPendingRequests(): Promise<Request[]> {
    return this.requestModel.find({ status: STATUS.PENDING })
      .populate('userId', 'name email')
      .populate('bookId', 'bookTitle author')
      .exec();
  }
  
  async getRequestsByUser(userId: string): Promise<Request[]> {
    return this.requestModel.find({ userId })
      .populate('bookId', 'bookTitle author')
      .exec();
  }
  
  async approveRequest(requestId: string): Promise<Request> {
    const request = await this.requestModel.findById(requestId);
    if (!request) {
      throw new NotFoundException('Request not found');
    }
    
    if (request.status !== STATUS.PENDING) {
      throw new BadRequestException('Request is not in pending status');
    }
    
    // Update request status
    request.status = STATUS.APPROVED;
    request.resolvedAt = new Date();
    
    return request.save();
  }
  
  async deleteRequest(requestId: string): Promise<Request> {
    const deletedRequest = await this.requestModel.findByIdAndDelete(requestId);
    
    if (!deletedRequest) {
      throw new NotFoundException('Request not found');
    }
    
    return deletedRequest;
  }
  
  async deleteRequestByBookTitle(bookTitle: string): Promise<void> {
    // First find the book by title
    const book = await this.bookModel.findOne({ bookTitle });
    if (!book) {
      throw new NotFoundException(`Book with title "${bookTitle}" not found`);
    }
    
    // Delete requests associated with this book
    await this.requestModel.deleteMany({ bookId: book._id });
  }
  
  async getRequestById(requestId: string): Promise<Request> {
    const request = await this.requestModel.findById(requestId)
      .populate('userId', 'name email')
      .populate('bookId', 'bookTitle author');
      
    if (!request) {
      throw new NotFoundException('Request not found');
    }
    
    return request;
  }
}