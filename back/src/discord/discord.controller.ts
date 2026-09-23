import { DiscordService } from './discord.service';
import {
    Controller,
    Get,
    Query,
    Res,
    Headers,
    Post,
    Req, Param, UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from '../auth/auth.service';
import { RequestWithSession } from '../requestWithSession.interface';
import {ApiHeaders, ApiParam, ApiProperty, ApiQuery, ApiResponse, ApiTags} from '@nestjs/swagger';
export class AuthParams {
    @ApiProperty({ description: 'The JWT token for authentication' })
    token: string;
}
@ApiTags('Discord')
@Controller('discord')
export class DiscordController {
    constructor(
        private discordService: DiscordService,
        private authService: AuthService,
    ) {}
    @ApiResponse({ status: 200, description: 'Get the user info' })
    @Get('me')
    async getMe(@Headers('authorization') authHeader: string) {
        const token = authHeader.split(' ')[1]; // Split "Bearer <token>"
        return this.discordService.getMe(token);
    }
    //need to use @ApiProperty to document the params for swagger for the auth endpoint
    @ApiQuery({ name: 'token', type: String , description: 'The JWT token for authentication' })
    @ApiResponse({ status: 200, description: 'Redirect to the discord auth page' })
    @Get('auth')
    auth(
        @Res() res: Response,
        @Query('token') token: string,
        @Req() req: RequestWithSession,
    ) {
        console.log('auth for discord');
        const authUrl = this.discordService.generateAuthUrl();
        req.session.jwtToken = token;

        return res.status(200).redirect(authUrl);
    }
    @ApiQuery({ name: 'code', type: String , description: 'The code from the discord auth page' })
    @ApiResponse({ status: 200, description: 'Redirect to the mobile app or if web, close the window' })
    @Get('callback')
    async callback(
        @Query('code') code: string,
        @Req() req: RequestWithSession,
        @Res() res: Response,
    ) {
        try {
            const { idToken, userData } =
                await this.discordService.getTokenFromCodeID(code);
            //will make a call to /me to get the user info
            console.log('userData', userData);
            const userAgent = req.headers['user-agent'];
            let redirectUrl = `${process.env.FRONTEND_URL}/explore`; // Default web redirect

            if (userAgent.includes('Flutter')) {
                console.log('userAgent', userAgent);
                // If the request is from a mobile app (Flutter in this case)
                //we will actually just close the webview and send the token back to the app
                redirectUrl = 'flutter';
                console.log('redirectUrl', redirectUrl);
            }
            //check if there is a idToken and if so, link the account if no thencall getDatawithoutTokenId to get the user info
            if (!userData.id_token) {
                console.log('userData.access_token', userData.access_token);
                const data = await this.discordService.getDataWithoutTokenIdButAccess(
                    userData.access_token,
                );
                console.log('data', data);
                userData.email = data.email;
                userData.name = data.display_name;
                userData.id = data.user.id;
                if (data.images) {
                    userData.image = data.images[0].url;
                }
            } else {
                console.log('userData.id_token', userData.id_token);
                const data = await this.discordService.getDataWithoutTokenIdButAccess(
                    userData.id_token,
                );
                console.log('data', data);
            }
            const jwtToken = req.session.jwtToken;
            if (!jwtToken) {
                throw new UnauthorizedException('No access token provided');
            }
            console.log('userData after mod', userData);
            const result = await this.authService.linkExternalAccount(
                'discord',
                userData,
                jwtToken,
            );

            // You might want to handle the token (e.g., store it, create a session, etc.)
            console.log('Redirecting to frontend...');
            if (redirectUrl === 'flutter') {
                return res.status(200).send({token: idToken});
            }
            // Instead of redirecting, return a script that closes the window
            return res.status(200).send(`
                <script>
                    window.close();
                </script>
            `);
        } catch (error) {
            let redirectUrl = `${process.env.FRONTEND_URL}/explore`; // Default web redirect
            const userAgent = req.headers['user-agent'];

            if (userAgent.includes('Flutter')) {
                console.log('userAgent', userAgent);
                // If the request is from a mobile app (Flutter in this case)
                //we will actually just close the webview and send the token back to the app
                redirectUrl = 'flutter';
                console.log('redirectUrl', redirectUrl);
            }
            console.error('Error in discord OAuth Callback:', error);
            if (error.response.message) {
                if (error.response.message === 'Account already linked') {
                    console.log('Account already linked');
                    if (redirectUrl === 'flutter') {
                        return res.status(403).send({token: error.response.idToken});
                    }
                    // Instead of redirecting, return a script that closes the window
                    return res.status(403).send(`
                        <script>
                            window.close();
                        </script>
                    `);
                }
            }
            return res.redirect('/error');
        }
    }
    //@APiquery header
    @ApiHeaders([{ name: 'authorization', required: true , description: 'A Bearer token of the user' }])
    @ApiResponse({ status: 200, description: 'Get the user channels under the good format' })
    @Get('channels')
    async getChannelsWithBot(@Headers('authorization') authHeader: string) {
        const token = authHeader.split(' ')[1];
        let channels = await this.discordService.fetchGuildChannelsWithBotPresent(token);

        // Filter channels where type is 0
        channels = channels.filter(channel => channel.type === 0);

        const formattedChannels = channels.map(channel => ({
            id: channel.id,
            name: channel.name
        }));

        return { items: formattedChannels };
    }

    @ApiHeaders([{ name: 'authorization', required: true , description: 'A Bearer token of the user' }])
    @ApiParam({ name: 'guildId', required: true , description: 'The guild id' })
    @ApiResponse({ status: 200, description: 'Get the user guilds under the good format' })
    @Get('guilds/:guildId/channels')
    async getGuildChannels(@Param('guildId') guildId: string, @Headers('authorization') authHeader: string) {
        const token = authHeader.split(' ')[1];
        return this.discordService.fetchGuildChannels(guildId, token);
    }
}