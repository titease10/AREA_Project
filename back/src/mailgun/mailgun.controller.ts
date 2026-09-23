import {Controller, Get, Query, Res, Req, Headers, Post, Body} from '@nestjs/common';
import {Response} from 'express';
import {AuthService} from '../auth/auth.service';
import { MailgunService } from './mailgun.service';
import {RequestWithSession} from "../requestWithSession.interface";
import {ApiBody, ApiHeaders, ApiParam, ApiProperty, ApiQuery, ApiResponse, ApiTags} from '@nestjs/swagger';
@ApiTags('Mailgun')
@Controller('mailgun')
export class MailgunController {

    constructor(private authService: AuthService, private MailgunService: MailgunService) {
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
            const result = this.MailgunService.createAccountFromJwtToken(token);
            console.log('result', result);
            return res.status(200).redirect(`${process.env.FRONTEND_URL}/explore`);

        } catch (error) {
            console.error('Error in Google OAuth Callback:', error);
            //check if its because the user already already has an account if so redirect to the frontend with the token
            return res.status(500).redirect(`${process.env.FRONTEND_URL}/explore`);
        }
    }

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
    @ApiBody({type: String, description: 'The from email'})
    @ApiBody({type: String, description: 'The to email'})
    @ApiBody({type: String, description: 'The subject'})
    @ApiBody({type: String, description: 'The text'})
    @ApiResponse({status: 200, description: 'Send mail'})
    @Post('send-mail')
    async sendMail(@Body() body: any, @Req() req: RequestWithSession) {
        try {
            const {from, to, subject, text} = body;
            const result = await this.MailgunService.postMailData({
                endpoint: 'messages',
                jwtToken: req.session.jwtToken,
                from,
                to,
                subject,
                text,
            });
            return result;
        } catch (error) {
            console.error('Error in sending mail:', error);
            return error;
        }
    }

}