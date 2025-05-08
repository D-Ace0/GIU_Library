import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Borrowed, STATUS as BorrowedSTATUS } from '../schemas/Borrowed.schema';
import { Book } from '../schemas/book.schema';
import { User } from '../schemas/user.schema';
import { Request, STATUS as RequestSTATUS } from '../schemas/request.schema';

@Injectable()
export class BorrowedService {
  constructor(
    @InjectModel(Borrowed.name) private borrowedModel: Model<Borrowed>,
    @InjectModel(Book.name) private bookModel: Model<Book>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Request.name) private requestModel: Model<Request>,
  ) {}

  async createBorrowedFromRequest(
    requestId: string,
    returnDays: number = 14,
  ): Promise<Borrowed> {
    // Find and validate the request
    const request = await this.requestModel.findById(requestId);
    if (!request) {
      throw new NotFoundException('Request not found');
    }

    // Check if the book is available
    const book = await this.bookModel.findById(request.bookId);
    if (!book) {
      throw new NotFoundException('Book not found');
    }

    if (book.stock <= 0) {
      throw new BadRequestException('Book is out of stock');
    }

    // Check if user exists
    const user = await this.userModel.findById(request.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update request status to approved if it was pending
    if (request.status === RequestSTATUS.PENDING) {
      request.status = RequestSTATUS.APPROVED;
      await request.save();
    } else if (request.status !== RequestSTATUS.APPROVED) {
      throw new BadRequestException(`Request status is ${request.status}, not pending or approved`);
    }

    // Calculate return date
    const borrowedAt = new Date();
    const returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + returnDays);

    // Create borrowed record
    const borrowed = new this.borrowedModel({
      bookId: book._id,
      userId: user._id,
      bookTitle: book.bookTitle,
      borrowedAt,
      returnDate,
      returned: false,
    });

    // Update book stock
    book.stock -= 1;
    if (book.stock === 0) {
      book.isOutOfStock = true;
    }

    // Add borrower to book's borrowers array
    if (!book.borrowers) {
      book.borrowers = [];
    }
    book.borrowers.push(borrowed._id);

    // Calculate nearest return date for the book
    if (!book.nearestReturnDate || returnDate < book.nearestReturnDate) {
      book.nearestReturnDate = returnDate;
    }

    // Save both documents
    await book.save();
    await borrowed.save();

    // Remove the request since it's been processed
    await this.requestModel.findByIdAndDelete(requestId);

    return borrowed;
  }

  async getAllBorrowed(): Promise<Borrowed[]> {
    return this.borrowedModel
      .find()
      .populate('userId', 'name email')
      .populate('bookId', 'bookTitle author')
      .exec();
  }

  async getActiveBorrowings(): Promise<Borrowed[]> {
    return this.borrowedModel
      .find({ returned: false })
      .populate('userId', 'name email')
      .populate('bookId', 'bookTitle author')
      .exec();
  }

  async getOverdueBorrowings(): Promise<Borrowed[]> {
    const today = new Date();
    return this.borrowedModel
      .find({
        returned: false,
        returnDate: { $lt: today },
      })
      .populate('userId', 'name email')
      .populate('bookId', 'bookTitle author')
      .exec();
  }

  async getUserBorrowings(userId: string): Promise<Borrowed[]> {
    return this.borrowedModel
      .find({ userId })
      .populate('bookId', 'bookTitle author')
      .exec();
  }

  async returnBook(borrowedId: string): Promise<Borrowed> {
    const borrowed = await this.borrowedModel.findById(borrowedId);
    if (!borrowed) {
      throw new NotFoundException('Borrowed record not found');
    }

    if (borrowed.returned) {
      throw new BadRequestException('Book is already returned');
    }

    // Update borrowed record
    borrowed.returned = true;
    borrowed.returnedAt = new Date();

    // Update book stock
    const book = await this.bookModel.findById(borrowed.bookId);
    if (book) {
      book.stock += 1;
      book.isOutOfStock = false;

      // Remove from borrowers array
      if (book.borrowers) {
        book.borrowers = book.borrowers.filter(
          (id) => id.toString() !== borrowedId,
        );
      }

      // Update nearest return date if needed
      if (book.borrowers.length === 0) {
        book.nearestReturnDate = null;
      } else {
        // Find the new nearest return date among remaining borrowings
        const activeBorrowings = await this.borrowedModel
          .find({
            bookId: book._id,
            returned: false,
          })
          .sort({ returnDate: 1 })
          .limit(1);

        if (activeBorrowings.length > 0) {
          book.nearestReturnDate = activeBorrowings[0].returnDate;
        }
      }

      await book.save();
    }

    return borrowed.save();
  }

  async deleteBorrowed(borrowedId: string): Promise<Borrowed> {
    const borrowed = await this.borrowedModel.findById(borrowedId);
    if (!borrowed) {
      throw new NotFoundException('Borrowed record not found');
    }

    // If book not yet returned, update book stock
    if (!borrowed.returned) {
      const book = await this.bookModel.findById(borrowed.bookId);
      if (book) {
        book.stock += 1;
        book.isOutOfStock = false;

        if (book.borrowers) {
          book.borrowers = book.borrowers.filter(
            (id) => id.toString() !== borrowedId,
          );
        }

        await book.save();
      }
    }

    // Reassign deleted and add null check
    const deleted = await this.borrowedModel.findByIdAndDelete(borrowedId);
    if (!deleted) {
      throw new NotFoundException('Borrowed record not found on delete');
    }

    return deleted;
  }

  async getBorrowedById(borrowedId: string): Promise<Borrowed> {
    const borrowed = await this.borrowedModel
      .findById(borrowedId)
      .populate('userId', 'name email username')
      .populate('bookId', 'bookTitle author summary publisher')
      .exec();

    if (!borrowed) {
      throw new NotFoundException('Borrowed record not found');
    }

    return borrowed;
  }
  // In BorrowedService
  async getBorrowedByUserId(userId: string): Promise<Borrowed[]> {
    console.log(`Fetching borrowed records for userId: ${userId}`);
    const borrowedRecords = await this.borrowedModel
      .find({ userId })
      .populate('userId', 'name email username')
      .populate('bookId', 'bookTitle')
      .exec();
    console.log('Borrowed records:', borrowedRecords);
    if (!borrowedRecords || borrowedRecords.length === 0) {
      console.log('No borrowed records for user');
      return [];
    }
    return borrowedRecords;
  }
}
