import { FacebookService } from './facebook.service';
import {
  Controller,
  Get,
  Query,
  Res,
  Headers,
  Post,
  Req,
  Body,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from '../auth/auth.service';
import { RequestWithSession } from '../requestWithSession.interface';
import { JwtService } from '@nestjs/jwt';
import {ApiHeaders, ApiParam, ApiProperty, ApiQuery, ApiResponse, ApiTags} from '@nestjs/swagger';
@ApiTags('Facebook')
@Controller('facebook')
export class FacebookController {
  constructor(
    private facebookService: FacebookService,
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}
  @ApiQuery({ name: 'token', type: String , description: 'The JWT token for authentication' })
  @ApiResponse({ status: 200, description: 'Redirect to the facebook auth page' })
  @Get('auth')
  auth(
    @Res() res: Response,
    @Query('token') token: string,
    @Req() req: RequestWithSession,
  ) {
    console.log('auth for facebook');
    const authUrl = this.facebookService.generateAuthUrl();
    req.session.jwtToken = token;

    // Store the redirectUri somewhere accessible in the callback (e.g., session)
    return res.redirect(authUrl);
  }
  @ApiQuery({ name: 'code', type: String , description: 'The code from the facebook auth page' })
    @ApiResponse({ status: 200, description: 'Redirect to the mobile app or if web, close the window' })
  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Req() req: RequestWithSession,
    @Res() res: Response,
  ) {
    try {
      console.log('we are in the callback');
      console.log('code', code);
      const dataRaw = await this.facebookService.getTokenFromCodeID(
        code,
        req.session.state,
      );
      console.log('dataRaw', dataRaw);
      const accessToken = dataRaw.userData.access_token;
      console.log('accessToken', accessToken);

      const userData = await this.facebookService.fetchUserData(accessToken);
      console.log('userData', userData);
      //will make a call to /me to get the user info
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
      const firstName = userData.name.split(' ')[0];
      const lastName = userData.name.split(' ')[1];
      const userDataFormatted = {
        id: userData.id,
        avatar_url: userData.avatar_url,
        html_url: userData.html_url,
        firstName: firstName,
        lastName: lastName,
        //?userData.email : null,
        email: userData.email ? userData.email : null,
        access_token: accessToken,
        scope: 'email public_profile pages_manage_posts',
        expires_in: dataRaw.userData.expires_in,
        token_type: dataRaw.userData.token_type,
      };
      const jwtToken = req.session.jwtToken;
      if (!jwtToken) {
        throw new UnauthorizedException('JWT token missing in session');
      }
      const result = await this.authService.linkExternalAccount(
        'facebook',
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
