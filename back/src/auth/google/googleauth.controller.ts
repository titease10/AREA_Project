import { GoogleAuthService } from './googleauth.service';
import {Controller, Get, Query, Res, Req, Headers, UnauthorizedException} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from '../auth.service';
import {RequestWithSession} from "../../requestWithSession.interface";
import {AuthDto} from "../dto";
import {ApiHeaders, ApiParam, ApiProperty, ApiQuery, ApiResponse, ApiTags} from '@nestjs/swagger';
@ApiTags('GoogleAuth')
@Controller('googleauth')
export class GoogleAuthController {

  constructor(private GoogleAuthService: GoogleAuthService,
              private authService: AuthService) {}
  @ApiResponse({ status: 200, description: 'Redirect to the google auth page' })
  @ApiQuery({ name: 'token', type: String , description: 'The JWT token for authentication' })
    @ApiQuery({ name: 'isNewAccount', type: Boolean , description: 'If the user is creating a new account' })
  @Get('auth')
  auth(
      @Res() res: Response,
      @Query('token') token: string,
      @Query('isNewAccount') isNewAccount: boolean,

      @Req() req: RequestWithSession,
  ) {
    console.log('auth for google');
    const authUrl = this.GoogleAuthService.generateAuthUrl();
    // Store the redirectUri somewhere accessible in the callback (e.g., session)
    if ((!token && isNewAccount == true) || (!token && isNewAccount == undefined)){
        console.log('token or isNewAccount is missing');
      req.session.isNewAccount = true;
      return res.redirect(authUrl);
    }

    console.log('token', token);
    req.session.jwtToken = token;
    req.session.isNewAccount = isNewAccount;
    return res.redirect(authUrl);
  }
  @Get('me')
  //we will the token from the frontend in the header
  async getMe(@Query('token') token: string) {
    return this.GoogleAuthService.getUserInfo(token);
  }
  @Get('playlists')
  async getUserPlaylists(@Headers('authorization') authHeader: string) {
    // Assuming the access token is stored in the request (e.g., in a cookie or a header)
    const token = authHeader.split(' ')[1]; // Split "Bearer <token>"
    if (!token) {
      throw new Error('No access token provided');
    }

    try {
      const playlists = await this.GoogleAuthService.fetchYoutubeData({
        endpoint: 'playlists', // Endpoint to fetch playlists
        jwtToken: token,       // Pass the JWT token or account ID
      });
      return playlists; // Return the fetched playlists
    } catch (error) {
      console.error('Error fetching YouTube playlists:', error);
      throw error;
    }
  }
  @ApiResponse({ status: 200, description: 'Redirect to the mobile app or if web, close the window' })
  @Get('callback')
  async callback(
      @Query('code') code: string,
      @Req() req: RequestWithSession,
      @Res() res: Response,
  ) {
    try {
      const { accessToken, idToken, userData } = await this.GoogleAuthService.getTokenFromCodeID(code);

      const jwtToken = req.session.jwtToken;
      const isNewAccount = req.session.isNewAccount;
      if ((!jwtToken && isNewAccount == false) || (!jwtToken && isNewAccount == undefined)){
        console.log('token or isNewAccount is missing');
        console.log('jwtToken', jwtToken);
        console.log('isNewAccount', isNewAccount);
        req.session.isNewAccount = true;
        return res.status(400).send({ message: 'Token or isNewAccount is missing' });
      }
      if (req.session.isNewAccount === true) {
        try {
          console.log('userData', userData);
          //we will decode the id_token to get the user info
          const decodedToken = this.GoogleAuthService.jwt.decode(idToken);
          const user = await this.authService.signUp({
            email: decodedToken.email,
            password: 'password',
            firstName: decodedToken.name.split(' ')[0],
            lastName: decodedToken.name.split(' ')[1],
          });
          //now that we have the user we need to sign the token
          const jwtToken = await this.authService.signToken(
              user.id,
              user.email,
          );
          console.log('user', user);
          //we now need to link the account
          const result = await this.authService.linkExternalAccount(
              'google',
              userData,
              jwtToken.access_token,
          );
          console.log(jwtToken.access_token);
          return res.send(`
            <div>
                <h1>Choose a password</h1>
                <form action="http://localhost:8080/auth/set-password" method="post">
                    <div>
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" required />
                        <input type="hidden" name="token" value="${jwtToken.access_token}" />
                    </div>
                    <div>
                        <button type="submit">Set Password</button>
                    </div>
                </form>
            </div>
        `);

        } catch (error) {
          console.error('Error in Google OAuth Callback:', error);
          //check if its because the user already already has an account if so redirect to the frontend with the token
          //if not redirect to the signup page with the token
          if (error.response.message === 'Account already linked') {
            // Instead of redirecting, return a script that closes the window
            return res.status(403).send(`
            <script>
                window.close();
            </script>
          `);
          }
        }
      }
      const result = await this.authService.linkExternalAccount(
          'google',
          userData,
            jwtToken,
          );
      return res.status(200).send(`
        <script>
            window.close();
        </script>
      `);
    } catch (error) {
      console.error('Error in Google OAuth Callback:', error);
      //check if its because the user already already has an account if so redirect to the frontend with the token
      //if not redirect to the signup page with the token
      if (error.response.message === 'Account already linked') {
        // Instead of redirecting, return a script that closes the window
        return res.status(403).send(`
        <script>
            window.close();
        </script>
      `);
      }
      console.log('error', error.response.message);
      return res.status(500).send({ message: error.response.message });
    }
  }

}