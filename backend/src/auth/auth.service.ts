import { BadRequestException, Injectable } from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { SignInDto } from './dto/signin.dto';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

@Injectable()
export class AuthService {
    constructor(@InjectModel(User.name) private userModel: Model<User>, private jwtService: JwtService,) { }



    async signin(signInDto: SignInDto, response: Response) {
        const { email, password } = signInDto;
        const existingUser = await this.userModel.findOne({ email });

        if (!existingUser) {
            throw new BadRequestException('Invalid username or password');
        }
        if (existingUser.password !== password) {
            throw new BadRequestException('Invalid username or password');
        }
    
        const { accessToken } = await this.generateUserToken(existingUser._id, existingUser.role, existingUser.username);
    
        response.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 1000, // 1 hour
            sameSite: 'strict',
        });
    
        return response.status(200).json({ message: 'Login successful', user: { username: existingUser.username, email: existingUser.email, role: existingUser.role, token: accessToken } });
    }
    

    async generateUserToken(user_id: mongoose.Types.ObjectId, role: string, name: string) {
        const accessToken = await this.jwtService.sign({ user_id, role, name });
        return { accessToken };
      }

      async signup(signUpDataDTO: SignUpDto, response: Response) {
        const { username, email, password, role } = signUpDataDTO;
        const existingUser = await this.userModel.findOne({ email });

        if (existingUser) {
            throw new BadRequestException('Unable to create user, email already exists');
        }

        const newUser = await this.userModel.create({
            username,
            email,
            password,
        });

        const userResponse = {
            username: newUser.username,
            email: newUser.email,
        
            createdAt: newUser.createdAt,
        };

        return response.status(201).json({ message: 'User created successfully', user: userResponse });
    }

    async signout(response: Response) {
        response.clearCookie('accessToken', {
            sameSite: 'lax', // Match the sameSite setting used in signin
        });

        return response.status(200).json({ message: 'Logout successful' });
    }
}
