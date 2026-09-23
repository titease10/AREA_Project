import { IsEmail, IsNotEmpty, IsString } from 'class-validator'
import {ApiProperty} from "@nestjs/swagger";

export class AuthDto { 
    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({ example: 'john@example.com', description: 'User email' })
    email: string;

    @IsString()
    @IsNotEmpty(
        {message: 'Password should not be empty'}
    )
    @ApiProperty({ example: 'password', description: 'User password' })
    password: string;

    @IsNotEmpty()
    @ApiProperty({ example: 'John', description: 'User first name' })
    firstName: string;

    @IsNotEmpty()
    @ApiProperty({ example: 'Doe', description: 'User last name' })
    lastName: string;
}

export class SignDto { 
    @IsEmail()
    @IsNotEmpty(
        {message: 'Email should not be empty'}
    )
    @ApiProperty({ example: 'john@example.com', description: 'User email' })
    email: string;

    @IsString()
    @IsNotEmpty(
        {message: 'Password should not be empty'}
    )
    @ApiProperty({ example: 'password', description: 'User password' })
    password: string;
}

export class SetPasswordDto {
    @IsString()
    @IsNotEmpty(
        {message: 'Password should not be empty'}
    )
    @ApiProperty({ example: 'password', description: 'User password' })
    password: string;
}
