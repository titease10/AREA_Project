import { MicrosoftService } from './microsoft.service';
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
@ApiTags('Microsoft')
@Controller('microsoft')
export class MicrosoftController {
  constructor(
    private microsoftService: MicrosoftService,
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}
  @ApiQuery({ name: 'token', type: String , description: 'The JWT token for authentication' })
    @ApiResponse({ status: 200, description: 'Redirect to the microsoft auth page' })

  @Get('auth')
  auth(
    @Res() res: Response,
    @Query('token') token: string,
    @Req() req: RequestWithSession,
  ) {
    console.log('auth for microsoft');
    console.log('redirectUri', token);
    const authUrl = this.microsoftService.generateAuthUrl();
    if (!token){
      console.log('token or isNewAccount is missing');
      return res.redirect(authUrl);
    }
    //if the user is creating a new account we need to store the token in the session

    req.session.jwtToken = token;
    // Store the redirectUri somewhere accessible in the callback (e.g., session)
    return res.status(200).redirect(authUrl);
  }
    @ApiQuery({ name: 'code', type: String , description: 'The code from the microsoft auth page' })
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
      const dataRaw = await this.microsoftService.getTokenFromCode(
          code,
          req.session.state,
      );
      console.log('dataRaw', dataRaw);
      let redirectUrl = `${process.env.FRONTEND_URL}/explore`; // Default web redirect

      //we now need to decode the jwt token to get the access token
      let accessToken = dataRaw.access_token;
      accessToken = this.jwtService.decode(accessToken);
      console.log('accessToken', accessToken);
      const jwtToken = req.session.jwtToken;
      if (!jwtToken) {
        return res.status(401).send('No JWT token provided');
      }
      let userDataFormatted = null;
      if (accessToken === null) {
          console.log('accessToken is null so its a personal account');
        const decodedToken = this.jwtService.decode(dataRaw.id_token);
        console.log('decodedToken', decodedToken);
        userDataFormatted
         = {
            id: decodedToken.sub,
            avatar_url: null,
            html_url: null,
            firstName: decodedToken.name.split(' ')[0],
            lastName: decodedToken.name.split(' ')[1],
            //?userData.email : null,
            email: decodedToken.email ? decodedToken.email : null,
            access_token: dataRaw.access_token,
            scope: 'email profile openid',
            expires_in: dataRaw.expires_in,
            token_type: 'Bearer',
        };
      } else {
        console.log('accessToken is not null so its a work account');
        let expires_inGoodFormat = accessToken.exp;
        console.log('expires_inGoodFormat', dataRaw);
        console.log('expires_inGoodFormat', dataRaw.access_token);

        //like that its a unix timestamp we need to convert it to be used like that :
//      expires_at: externalUser.expires_in ? Math.floor(Date.now() / 1000) + externalUser.expires_in : null,
        //we need to convert it to seconds
        expires_inGoodFormat = expires_inGoodFormat - Math.floor(Date.now() / 1000);
        userDataFormatted = {
          id: accessToken.sub,
          avatar_url: null,
          html_url: null,
          firstName: accessToken.given_name,
          lastName: accessToken.family_name,
          //?userData.email : null,
          email: accessToken.upn ? accessToken.upn : null,
          //stringtify the object to be able to store it in the database
          access_token: dataRaw.access_token,
          scope: 'email profile openid',
          expires_in: expires_inGoodFormat,
          token_type: 'Bearer',
        };
      }
      // we now need to format this under the same format as the other external accounts

      const result = await this.authService.linkExternalAccount(
          'microsoft',
          userDataFormatted,
          jwtToken,
      );
      const userAgent = req.headers['user-agent'];

      if (userAgent.includes('Flutter')) {
        console.log('userAgent', userAgent);
        // If the request is from a mobile app (Flutter in this case)
        //we will actually just close the webview and send the token back to the app
        redirectUrl = 'flutter';
        console.log('redirectUrl', redirectUrl);
      }
      // You might want to handle the token (e.g., store it, create a session, etc.)
      console.log('Redirecting to frontend...');
      if (redirectUrl === 'flutter') {
        return res.status(200).send({ token: dataRaw.id_token });
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
      console.error('Error in Github OAuth Callback:', error);
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
  //use fetchMicrosoftData of microsoftService
    @ApiHeaders([{name: 'authorization', description: 'The JWT token for authentication'}])
    @ApiResponse({status: 200, description: 'Get the endpoint data'})
    @ApiQuery({ name: 'endpoint', type: String , description: 'The endpoint to fetch data from' })
  @Get('fetchDataOnMicrosoft')
async fetchDataOnMicrosoft(
      @Headers('authorization') authHeader: string,
      @Query('endpoint') endpoint: string,
  ): Promise<any> {
    try {

      console.log('fetchDataOnMicrosoft: endpoint', endpoint);

      const token = authHeader.split(' ')[1]; // Split "Bearer <token>"
      const response = await this.microsoftService.fetchMicrosoftData({
        endpoint: endpoint,
        jwtToken: token,
      });
      console.log('fetchDataOnMicrosoft: response', response);
      return response;
    } catch (error) {
      console.error('Error in fetchDataOnMicrosoft', error);
      throw error;
    }
  }

}
