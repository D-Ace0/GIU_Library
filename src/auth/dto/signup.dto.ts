import { IsEmail, IsString, MinLength, IsIn, MaxLength, IsNotEmpty, isNumber, IsNumber, isString, max } from 'class-validator'


export class SignUpDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(6)
    @IsNotEmpty()
    @MaxLength(20)
    password: string;

    @IsString()
    @IsIn(['student', 'admin'])
    role?: string='student';
}