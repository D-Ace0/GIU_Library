import { Body, Controller, Post, Res, UseGuards,Get } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import { AuthenticationGuard } from 'src/guards/authentication.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @Post('signup')
  async signup(@Body() signUpData: SignUpDto, @Res() response: Response) {
    const result = await this.authService.signup(signUpData, response);
    return result;
  }

  @Post('signin')
  async signin(@Body() signInData: SignInDto, @Res() response: Response) {
    const result = await this.authService.signin(signInData, response);
    return result;
  }

  @Post('signout')
  @UseGuards(AuthenticationGuard)
  async signout(@Res() response: Response) {
    const result = await this.authService.signout(response);
    return result;
  }

  @Get()
  async findAll(@Body() token: string) {
    const result=await this.authService.TokenTranslator(token)

  }
}