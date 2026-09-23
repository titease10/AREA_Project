import { GithubService } from "./github.service";
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
@ApiTags('Github')
@Controller('github')
export class GithubController {
    constructor(
        private githubService: GithubService,
        private authService: AuthService,
        private jwtService: JwtService,
    ) {
    }
    @ApiQuery({name: 'token', type: String, description: 'The JWT token for authentication'})
    @ApiResponse({status: 200, description: 'Redirect to the github auth page'})
    @Get('auth')
    auth(
        @Res() res: Response,
        @Query('token') token: string,
        @Req() req: RequestWithSession,
    ) {
        console.log('auth for github');
        const authUrl = this.githubService.generateAuthUrl();
        req.session.jwtToken = token;

        // Store the redirectUri somewhere accessible in the callback (e.g., session)
        return res.redirect(authUrl);
    }
    @ApiQuery({name: 'code', type: String, description: 'The code from the github auth page'})
    @ApiResponse({status: 200, description: 'Redirect to the mobile app or if web, close the window'})
    @Get('callback')
    async callback(
        @Query('code') code: string,
        @Req() req: RequestWithSession,
        @Res() res: Response,
    ) {
        try {
            const accessToken = await this.githubService.getTokenFromCode(code, req.session.state);
            const userData = await this.githubService.fetchUserData(accessToken);
            console.log('userData', userData);
            //will make a call to /me to get the user info
            console.log('accessToken', accessToken);
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
            if (!accessToken) {
                throw new UnauthorizedException('No access token provided');
            }
            let userDataFormatted = {
                id: userData.id,
                avatar_url: userData.avatar_url,
                html_url: userData.html_url,
                firstName: userData.login,
                lastName: userData.login,
                //?userData.email : null,
                email: userData.email?userData.email : null,
                access_token: accessToken,
                scope: 'repo user'
            }
            const jwtToken = req.session.jwtToken;
            if (!jwtToken) {
                throw new UnauthorizedException('JWT token missing in session');
            }
            const result = await this.authService.linkExternalAccount(
                'github',
                userDataFormatted,
                jwtToken,
            );

            // You might want to handle the token (e.g., store it, create a session, etc.)
            console.log('Redirecting to frontend...');
            if (redirectUrl === 'flutter') {
                return res.send({ token: accessToken });
            }
            return res.send(`
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
            console.error('Error in Github OAuth Callback:', error);
            if (error.response.message === 'Account already linked') {
                console.log('Account already linked');
                if (redirectUrl === 'flutter') {
                    return res.send({ token: error.response.idToken });
                }
                return res.send(`
                <script>
                    window.close();
                </script>
            `);
            }
            return res.redirect('/error');
        }
    }

}