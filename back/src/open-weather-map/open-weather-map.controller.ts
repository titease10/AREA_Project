import {Controller, Get, Query, Res, Req, Headers} from '@nestjs/common';
import {Response} from 'express';
import {AuthService} from '../auth/auth.service';
import {OpenWeatherMapService} from './open-weather-map.service';
import {RequestWithSession} from "../requestWithSession.interface";
import {ApiHeaders, ApiParam, ApiProperty, ApiQuery, ApiResponse, ApiTags} from '@nestjs/swagger';
@ApiTags('Open Weather Map')
@Controller('open-weather-map')
export class OpenWeatherMapController {

    constructor(private authService: AuthService, private openWeatherMapService: OpenWeatherMapService) {
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
            const result = this.openWeatherMapService.createAccountFromJwtToken(token);
            console.log('result', result);
            return res.status(200).redirect(`${process.env.FRONTEND_URL}/explore`);

        } catch (error) {
            console.error('Error in Google OAuth Callback:', error);
            //check if its because the user already already has an account if so redirect to the frontend with the token
            return res.status(500).redirect(`${process.env.FRONTEND_URL}/explore`);
        }
    }
    @ApiResponse({status: 200, description: 'Get the weather options'})
    @Get('weather')
    async getWeather(@Headers('authorization') authHeader: string) {
        // Assuming the access token is stored in the request (e.g., in a cookie or a header)
        const token = authHeader.split(' ')[1]; // Split "Bearer <token>"
        if (!token) {
            throw new Error('No access token provided');
        }

        try {
            const weatherOptions = [
                {id: 1, name: "Rain"},
                {id: 2, name: "Clouds"},
                {id: 3, name: "Sunny"},
                {id: 4, name: "Snow"},
                {id: 5, name: "Windy"},
                {id: 6, name: "Clear"},
                {id: 7, name: "Mist"},
                {id: 8, name: "Smoke"},
                {id: 9, name: "Haze"},
                {id: 10, name: "Dust"},
                {id: 11, name: "Fog"},
                {id: 12, name: "Sand"},
                {id: 13, name: "Ash"},
                {id: 14, name: "Squall"},
                {id: 15, name: "Tornado"},
                {id: 16, name: "Drizzle"},
                {id: 17, name: "Thunderstorm"}
            ];
            return { items: weatherOptions }; // Wrap the array in an object
        } catch (error) {
            console.error('Error fetching YouTube playlists:', error);
            throw error;
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