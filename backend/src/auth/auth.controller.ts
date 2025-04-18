import {Body, Controller, Post, Res, UseGuards} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import {Response} from 'express';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @Post('signup')
  async signup(@Body() signUpData: SignUpDto) {
    const result = await this.authService.signup(signUpData);
    return result;
  }

  @Post('signin')
  async signin(@Body() signInData: SignInDto, @Res() res: Response) {
    return this.authService.signin(signInData, res);
  }

  @Post('signout')
  @UseGuards(AuthenticationGuard)
  async signout() {
    const result = await this.authService.signout();
    return result;
  }

}