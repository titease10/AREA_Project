import {Controller, Get, Query, Res, Req, Headers} from '@nestjs/common';
import {Response} from 'express';
import {AuthService} from '../auth/auth.service';
import {TimeioService} from './timeio.service';
import {RequestWithSession} from "../requestWithSession.interface";
import {ApiHeaders, ApiParam, ApiProperty, ApiQuery, ApiResponse, ApiTags} from '@nestjs/swagger';
@ApiTags('Timeio')

@Controller('timeio')
export class TimeioController {

    constructor(private authService: AuthService, private TimeioService: TimeioService) {
    }
    @ApiHeaders([{name: 'authorization', description: 'The JWT token for authentication'}])
    @ApiResponse({status: 200, description: 'Get the user info'})
    @Get('auth')
    auth(@Headers('authorization') authHeader: string, @Res() res: Response) {
        const token = authHeader.split(' ')[1]; // Split "Bearer <token>"
        if (!token) {
            throw new Error('No access token provided');
        }
        try {
            const result = this.TimeioService.createAccountFromJwtToken(token);
            console.log('result', result);
            return res.status(200).redirect(`${process.env.FRONTEND_URL}/explore`);

        } catch (error) {
            console.error('Error in Google OAuth Callback:', error);
            //check if its because the user already already has an account if so redirect to the frontend with the token
            return res.status(500).redirect(`${process.env.FRONTEND_URL}/explore`);
        }
    }
    @ApiResponse({status: 200, description: 'Get the user info'})
    @ApiQuery({ name: 'code', type: String , description: 'The code from the spotify auth page' })
    @Get('callback')
    async callback(@Query('code') code: string, @Res() res: Response) {
        try {
            //
            return res.status(200).redirect(`${process.env.FRONTEND_URL}/explore`);
        } catch (error) {
            console.error('Error in Google OAuth Callback:', error);
            //check if its because the user already already has an account if so redirect to the frontend with the token
            return res.status(500).redirect(`${process.env.FRONTEND_URL}/explore`);
        }
    }
}