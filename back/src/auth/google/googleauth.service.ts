import { Injectable } from '@nestjs/common';
import { BaseAuthService } from '../../Base/baseauth/baseauth.service';
import { OAuth2Client } from 'google-auth-library';
import axios from "axios";
import {RefreshTokenParamsDto} from "../../interfaces/refreshToken.interface";
import {ServiceManagerService} from '../../serviceManager/serviceManager.service';
import {PrismaService} from "../../prisma/prisma.service";
import {JwtService} from "@nestjs/jwt";
interface FetchYoutubeDataParams {
  endpoint: string;
  jwtToken?: string;
  accountId?: string;
  additionalParams?: Record<string, any>;
}
@Injectable()
export class GoogleAuthService extends BaseAuthService {
  private oauth2Client: OAuth2Client;

  constructor(
      private serviceManager: ServiceManagerService,
      public jwt: JwtService,

      public prisma: PrismaService,
  ) {
    super(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'https://accounts.google.com/o/oauth2/v2/auth',
        'https://oauth2.googleapis.com/token',
        prisma,
    );

    this.oauth2Client = new OAuth2Client(
        this.clientId,
        this.clientSecret,
        `${process.env.IP_HOSTER}/googleauth/callback`, // Redirect URI
    );
    console.log('GoogleAuthService constructor');
    this.setSupportedActionsAndEvents();
    serviceManager.registerService('google', this);
  }

  protected async initializeAccessToken(): Promise<void> {
  }

  generateAuthUrl(): string {
    const scopes = [
      'email',
      'profile',
      'openid',
      'https://www.googleapis.com/auth/youtube' // Add this scope
    ];
    const redirectUri = `${process.env.IP_HOSTER}/googleauth/callback`;
    const extraParams = {
      access_type: 'offline',
      prompt: 'consent',
      state: 'some-random-state',
    };

    return super.generateAuthUrl(scopes, redirectUri, 'code', extraParams);
  }


  async getTokenFromCodeID(code: string): Promise<{ accessToken: string; idToken: string; userData: any }> {
    const redirectUri = `${process.env.IP_HOSTER}/googleauth/callback`;
    const response = await this.exchangeAuthorizationCodeForToken(
        code,
        'https://oauth2.googleapis.com/token',
        redirectUri,
    );
    console.log('response', response);

    return {accessToken: response.access_token, idToken: response.id_token, userData: response};
  }


  async getUserInfo(accessToken: string): Promise<any> {
    try {
      console.log('accessToken', accessToken);
      const response = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {Authorization: `Bearer ${accessToken}`},
      });
      return response.data; // contains user info like email, name, etc.
    } catch (error) {
      this.logger.error('Error fetching user info:', error);
      throw error;
    }
  }


  async getDataWithoutTokenId(): Promise<any> {
  }


  async setSupportedActionsAndEvents() {
    //call get actions and get reactions
    await this.setActions('../../auth/google')
    console.log('actions set :D');
    await this.setReactions('../../auth/google')
  }
  async refreshToken({accountId, jwtToken, token}: RefreshTokenParamsDto): Promise<any> {
    try {
      let googleAccount;
      // Logic to get googleAccount based on accountId, jwtToken, or token
      if (accountId) {
        // Fetch account using account ID
        googleAccount = await this.prisma.account.findFirst({
          where: {id: accountId},
        });
      } else if (jwtToken) {
        // Fetch account using JWT token
        const decoded = this.jwt.decode(jwtToken);
        const userId = decoded.sub;
        googleAccount = await this.prisma.account.findFirst({
          where: {userId: userId, provider: 'google'},
        });
        console.log('spotifyAccount found with jwt token', googleAccount);
      } else if (token) {
        // Fetch account using access token
        console.log('token', token);
        googleAccount = await this.prisma.account.findFirst({
          where: {access_token: token, provider: 'google'},
        });
        console.log('spotifyAccount found with acces token', googleAccount);
      } else {
        throw new Error('No valid parameter provided for token refresh.');
      }
      if (!googleAccount || !googleAccount.refresh_token) {
        throw new Error('Google account not found or refresh token missing.');
      }

      const params = new URLSearchParams();
      params.append('client_id', this.clientId);
      params.append('client_secret', this.clientSecret);
      params.append('refresh_token', googleAccount.refresh_token);
      params.append('grant_type', 'refresh_token');

      const response = await axios.post(
          'https://oauth2.googleapis.com/token',
          params,
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
      );

      if (response.data && response.data.access_token) {
        // Update the access token in the database
        await this.prisma.account.update({
          where: { id: googleAccount.id },
          data: {
            access_token: response.data.access_token,
            expires_at: Math.floor(Date.now() / 1000) + response.data.expires_in,
          },
        });
        console.log('Google access token successfully refreshed.');
        return response.data.access_token;
      } else {
        throw new Error('Failed to refresh access token');
      }
    } catch (error) {
      console.error('Error refreshing Google access token', error);
      throw error;
    }
  }
  async fetchYoutubeData({
                           endpoint,
                           jwtToken,
                           accountId,
                           additionalParams = {}
                         }: FetchYoutubeDataParams): Promise<any> {
    try {
      let googleAccount;

      // Determine the account to use
      if (jwtToken) {
        const decoded = this.jwt.decode(jwtToken);
        googleAccount = await this.prisma.account.findFirst({
          where: {userId: decoded.sub, provider: 'google'},
        });
      } else if (accountId) {
        googleAccount = await this.prisma.account.findFirst({
          where: {id: accountId, provider: 'google'},
        });
      } else {
        throw new Error('No valid parameters provided for Google fetch.');
      }

      if (!googleAccount) {
        throw new Error('Google account not found.');
      }

      // Check if the token is still valid, refresh if necessary
      const now = new Date();
      const expiresAt = new Date(googleAccount.expires_at * 1000);
      if (now >= expiresAt) {
        console.log('Refreshing Google access token...');
        const refreshedToken = await this.refreshToken({
          accountId: googleAccount.id,
        });
        googleAccount.access_token = refreshedToken;
      }

      // Fetch data from YouTube
      const youtubeApiKey = process.env.GOOGLE_API_KEY; // Retrieve the API key from environment variables
      console.log('youtubeApiKey', youtubeApiKey);
      const params = new URLSearchParams({
        ...additionalParams,
        key: youtubeApiKey
      });

      const response = await axios.get(`https://www.googleapis.com/youtube/v3/${endpoint}?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${googleAccount.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data; // Contains the YouTube data
    } catch (error) {
      console.error('Error fetching Youtube data:', error);
      throw error;
    }
  }

}