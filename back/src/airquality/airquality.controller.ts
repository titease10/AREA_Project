import {Controller, Get, Query, Res, Req, Headers} from '@nestjs/common';
import {Response} from 'express';
import {AuthService} from '../auth/auth.service';
import {airQualityService} from './airquality.service';
import {RequestWithSession} from "../requestWithSession.interface";
import {ApiHeaders, ApiParam, ApiProperty, ApiQuery, ApiResponse, ApiTags} from '@nestjs/swagger';
@ApiTags('Air Quality')
@Controller('airquality')
export class AirqualityController {

    constructor(private authService: AuthService, private airQualityService: airQualityService) {
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
            const result = this.airQualityService.createAccountFromJwtToken(token);
            console.log('result', result);
            return res.status(200).redirect(`${process.env.FRONTEND_URL}/explore`);

        } catch (error) {
            console.error('Error in Google OAuth Callback:', error);
            //check if its because the user already already has an account if so redirect to the frontend with the token
            return res.status(500).redirect(`${process.env.FRONTEND_URL}/explore`);
        }
    }
    @ApiQuery({ name: 'city', required: true, type: String, description: 'City name for querying air quality data' })
    @ApiResponse({ status: 200, description: 'Get air quality data for a specified city' })
    @Get('data')
    async getAirQualityData(@Query('city') city: string, @Res() res: Response) {
        if (!city) {
            return res.status(400).send('City parameter is required');
        }
        try {
            const airQualityData = await this.airQualityService.fetchairQualityData({ endpoint: 'feed/' + city });
            return res.json(airQualityData);
        } catch (error) {
            console.error('Error fetching air quality data:', error);
            return res.status(500).send('Error fetching air quality data');
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

}