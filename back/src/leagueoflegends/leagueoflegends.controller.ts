import {Controller, Get, Query, Res, Req, Headers} from '@nestjs/common';
import {Response} from 'express';
import {AuthService} from '../auth/auth.service';
import {leagueOfLegendsService} from './leagueoflegends.service';
import {RequestWithSession} from "../requestWithSession.interface";
import {ApiHeaders, ApiParam, ApiProperty, ApiQuery, ApiResponse, ApiTags} from '@nestjs/swagger';
@ApiTags('League of Legends')
@Controller('leagueoflegends')
export class LeagueoflegendsController {

    constructor(private authService: AuthService, private leagueOfLegendsService: leagueOfLegendsService) {
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
            const result = this.leagueOfLegendsService.createAccountFromJwtToken(token);
            console.log('result', result);
            return res.redirect(`${process.env.FRONTEND_URL}/explore`);

        } catch (error) {
            console.error('Error in Google OAuth Callback:', error);
            //check if its because the user already already has an account if so redirect to the frontend with the token
            return res.redirect(`${process.env.FRONTEND_URL}/explore`);
        }
    }
    @ApiQuery({name: 'playerIdOrName', type: String, description: 'The player id or name'})
    @ApiResponse({status: 200, description: 'Get the last game data for the player'})
    @Get('check-in-game')
    async checkIfPlayerInGame(@Query('playerIdOrName') playerIdOrName: string) {
        try {
            const result = await this.leagueOfLegendsService.getLastGameDataOnlyPlayer(playerIdOrName);
            return result;
        } catch (error) {
            console.error('Error in checking if player is in game:', error);
            throw error;
        }
    }

    @Get('callback')
    async callback(@Query('code') code: string, @Res() res: Response) {
        try {
            //
            return res.redirect(`${process.env.FRONTEND_URL}/explore`);
        } catch (error) {
            console.error('Error in Google OAuth Callback:', error);
            //check if its because the user already already has an account if so redirect to the frontend with the token
            return res.redirect(`${process.env.FRONTEND_URL}/explore`);
        }
    }
    @ApiResponse({status: 200, description: 'Get all champions'})
    @Get('champions')
    async getAllChampions() {
        try {
            const result = await this.leagueOfLegendsService.getAllChampions();
            return result;
        } catch (error) {
            console.error('Error in getting all champions:', error);
            throw error;
        }
    }
}