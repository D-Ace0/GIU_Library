import { IsEmail, IsString, MinLength, IsIn, MaxLength, IsNotEmpty } from 'class-validator'


export class SignInDto {
    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}