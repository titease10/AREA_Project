import {Controller, Get, Query, Res, UnauthorizedException, Req, Headers, Post, Body} from '@nestjs/common';
import { TwitterService } from './twitter.service';
import { Response } from 'express';
import { AuthService } from '../auth/auth.service';
import {RequestWithSession} from "../requestWithSession.interface";
import {JwtService} from "@nestjs/jwt";
import {ApiBody, ApiHeaders, ApiParam, ApiProperty, ApiQuery, ApiResponse, ApiTags} from '@nestjs/swagger';

@ApiTags('Twitter')
@Controller('twitter')
export class TwitterController {
  constructor(private twitterService: TwitterService, private authService: AuthService,private jwtService: JwtService,) {}
  @ApiResponse({ status: 200, description: 'Redirect to the twitter auth page' })
  @ApiQuery({ name: 'token', type: String , description: 'The JWT token for authentication' })
  @Get('auth')
  async auth(
      @Res() res: Response,
      @Query('token') token: string,
      @Req() req: RequestWithSession,
    ) {
    console.log('auth for twitter');
    const authUrl = await this.twitterService.generateAuthUrlOath1();
    req.session.jwtToken = token;
    return res.status(200).redirect(authUrl);
  }
    @ApiResponse({ status: 200, description: 'Redirect to the mobile app or if web, close the window' })
    @ApiQuery({ name: 'oauth_token', type: String , description: 'The oauth_token from the twitter auth page' })
    @ApiQuery({ name: 'oauth_verifier', type: String , description: 'The oauth_verifier from the twitter auth page' })
  @Get('callback')
  async callback(
    @Query('oauth_token') oauthToken: string,
    @Query('oauth_verifier') oauthVerifier: string,
    @Req() req: RequestWithSession,
    @Res() res: Response,
  ) {
    try {
      const {accessToken, tokenSecret} =
        await this.twitterService.getTokenFromCodeOath1(
          oauthToken,
          oauthVerifier,
        );
        const userData = await this.twitterService.getUserProfile(accessToken, tokenSecret);
        userData.firstName = userData.data.name;
        userData.lastName = userData.data.username;
        userData.access_token = accessToken;
        userData.refresh_token = tokenSecret;
        userData.token_type = 'oauth1';
        userData.provider = 'twitter';
        const jwtToken = req.session.jwtToken;
        if (!jwtToken) {
          return res.status(401).send('No token provided');
        }
        const result = await this.authService.linkExternalAccount(
            'twitter',
            userData,
            jwtToken,
        );

      // You can now redirect to your front-end with appropriate parameters
      return res.send(`
                <script>
                    window.close();
                </script>
            `);
    } catch (error) {
      if (error.response.message === 'Account already linked') {
        return res.status(200).send(`
                <script>
                    window.close();
                </script>
            `);
      }
      console.error('Error in Twitter Callback:', error);
      return res.status(500).send('Something went wrong');
    }
  }
    @ApiHeaders([{name: 'authorization', description: 'The JWT token for authentication'}])
    @ApiBody({description: 'The message to post', type: String})
    @ApiResponse({status: 200, description: 'Post a tweet'})
  @Post('tweet')
  async tweet(@Headers('authorization') authHeader: string, @Body('message') message: string) {
    try {
      console.log('authHeader', authHeader);
      const token = authHeader.split(' ')[1];
      const decodedToken = this.jwtService.decode(token) as any;
      console.log('decodedToken', decodedToken);

      if (!decodedToken || !decodedToken.sub) {
        throw new UnauthorizedException('Invalid token');
      }

      const twitterAccount = await this.twitterService.getTwitterAccount({ userId: decodedToken.sub });
      console.log('twitterAccount', twitterAccount);

      if (!twitterAccount) {
        throw new UnauthorizedException('Twitter account not found');
      }

      await this.twitterService.postTweet(message, twitterAccount.access_token, twitterAccount.refresh_token);
      return { success: true };
    }
    catch (e) {
      console.error('error', e);
      return { success: false, error: e.message };
    }
  }
}
