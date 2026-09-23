import { SpotifyService } from './spotify.service';
import {
    Controller,
    Get,
    Query,
    Res,
    Headers,
    Post,
    Req, Body, UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from '../auth/auth.service';
import { RequestWithSession } from '../requestWithSession.interface';
import {JwtService} from "@nestjs/jwt";
import {ApiHeaders, ApiParam, ApiProperty, ApiQuery, ApiResponse, ApiTags} from '@nestjs/swagger';
@ApiTags('Spotify')
@Controller('spotify')
export class SpotifyController {
    constructor(
        private spotifyService: SpotifyService,
        private authService: AuthService,
        private jwtService: JwtService,
    ) {}

    @ApiResponse({ status: 200, description: 'Redirect to the spotify auth page' })
    @Get('me')
    async getMe(@Headers('authorization') authHeader: string) {
        const token = authHeader.split(' ')[1]; // Split "Bearer <token>"
        return this.spotifyService.getMe(token);
    }
    @ApiResponse({ status: 200, description: 'Return the current player data' })
    @Get('player')
    async getPlayer(@Headers('authorization') authHeader: string) {
        // Extract the token from the Authorization header
        const token = authHeader.split(' ')[1]; // Split "Bearer <token>"
        return this.spotifyService.getPlayer(token);
    }

    @ApiResponse({ status: 200, description: 'Redirect to the spotify auth page' })
    @ApiQuery({ name: 'token', type: String , description: 'The JWT token for authentication' })
    @Get('auth')
    auth(
        @Res() res: Response,
        @Query('token') token: string,
        @Req() req: RequestWithSession,
    ) {
        console.log('auth for spotify');
        const authUrl = this.spotifyService.generateAuthUrl();
        // Store the redirectUri somewhere accessible in the callback (e.g., session)
        req.session.jwtToken = token;
        return res.status(200).redirect(authUrl);
    }

    @ApiResponse({ status: 200, description: 'Redirect to the mobile app or if web, close the window' })
    @ApiQuery({ name: 'code', type: String , description: 'The code from the spotify auth page' })
    @Get('callback')
    async callback(
        @Query('code') code: string,
        @Req() req: RequestWithSession,
        @Res() res: Response,
    ) {
        try {
            const { idToken, userData } =
                await this.spotifyService.getTokenFromCodeID(code);
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
                const data = await this.spotifyService.getDataWithoutTokenIdButAccess(
                    userData.access_token,
                );
                console.log('data', data);
                userData.email = data.email;
                userData.name = data.display_name;
                userData.id = data.id;
            }
            const jwtToken = req.session.jwtToken;
            if (!jwtToken) {
                return res.status(401).send('No JWT token provided');
            }
            const result = await this.authService.linkExternalAccount(
                'spotify',
                userData,
                jwtToken,
            );

            // You might want to handle the token (e.g., store it, create a session, etc.)
            console.log('Redirecting to frontend...');
            if (redirectUrl === 'flutter') {
                return res.status(200).send({ token: idToken });
            }
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
            console.error('Error in Spotify OAuth Callback:', error);
            if (error.response.message === 'Account already linked') {
                console.log('Account already linked');
                if (redirectUrl === 'flutter') {
                    return res.status(403).send({ token: error.response.idToken });
                }
                return res.status(403).send(`
                <script>
                    window.close();
                </script>
            `);
            }
            return res.redirect('/error');
        }
    }

    @ApiResponse({ status: 200, description: 'Return the Playlists that the user has' })
    @ApiHeaders([{name: 'authorization', description: 'The JWT token for authentication'}])
    @Get('playlists')
    async getPlaylists(@Headers('authorization') authHeader: string) {
        const token = authHeader.split(' ')[1];
        const playlists = await this.spotifyService.getUserPlaylists(token);

        // Map the response to include only id and name
        const formattedPlaylists = playlists.items.map(playlist => ({
            id: playlist.id,
            name: playlist.name
        }));

        return { items: formattedPlaylists };
    }

    @ApiResponse({ status: 200, description: 'Return the Shows that the user has' })
    @ApiHeaders([{name: 'authorization', description: 'The JWT token for authentication'}])
    @Get('shows')
    async getShow(@Headers('authorization') authHeader: string) {
        const token = authHeader.split(' ')[1];
        const shows = await this.spotifyService.fetchSpotifyData({ endpoint: '/me/shows', jwtToken: token });

        // Map the response to include only id and name
        const formattedShows = shows.items.map(item => ({
            id: item.show.id,
            name: item.show.name
        }));

        return { items: formattedShows };
    }

}