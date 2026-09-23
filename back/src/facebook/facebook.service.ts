import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { BaseAuthService } from '../Base/baseauth/baseauth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ServiceManagerService } from '../serviceManager/serviceManager.service';
import {RefreshTokenParamsDto} from "../interfaces/refreshToken.interface";
import { randomBytes } from 'crypto';
import { IQuery } from '../interfaces/iQuerry.interface';
import * as process from "process";

interface FetchFacebookDataParams {
  endpoint: string;
  jwtToken?: string;
  accountId?: string;
  userID?: string;
  additionalParams?: Record<string, any>;
}

@Injectable()
export class FacebookService extends BaseAuthService {
  constructor(
    public prisma: PrismaService,
    private jwt: JwtService,
    private serviceManager: ServiceManagerService,
  ) {
    super(
      process.env.FACEBOOK_CLIENT_ID, // Use your Facebook client ID
      process.env.FACEBOOK_CLIENT_SECRET, // Use your Facebook client secret
      'https://www.facebook.com/v18.0/dialog/oauth', // Facebook's authorization endpoint
      'https://graph.facebook.com/v18.0', // Facebook's API base URL
      prisma,
    );
    console.log('FacebookService constructor');
    this.setSupportedActionsAndEvents();
    serviceManager.registerService('facebook', this);
  }
  // Implement refreshToken method for GitHub
  async refreshToken({
    accountId,
    jwtToken,
    token,
  }: RefreshTokenParamsDto): Promise<any> {
    // Refresh token implementation specific to Facebook
  }

  protected async initializeAccessToken(): Promise<void> {
    // Initialize access token for Facebook
  }

  generateAuthUrl(): string {
    const scopes = ['email', 'public_profile']; // Define required Facebook scopes
    const redirectUri = `${process.env.IP_HOSTER}/facebook/callback`;
    //add a extraParams object to the generateAuthUrl method to send    &client_secret={app-secret}

    return super.generateAuthUrl(scopes, redirectUri);
    }
  async fetchUserData(accessToken: string): Promise<any> {
    const response = await axios.get('https://graph.facebook.com/v18.0/me', {
      params: {
        access_token: accessToken,
        fields: 'id,name,email,picture,birthday',

      }
    });
    console.log('response.data', response.data);
    return response.data; // Contains user data
  }

  async getDataWithoutTokenId(): Promise<any> {}
  async getTokenFromCode(code: string, state: string): Promise<string> {
    // Verify the 'state' parameter here if necessary
    const params = new URLSearchParams();
    params.append('client_id', this.clientId);
    params.append('redirect_uri', `${process.env.IP_HOSTER}/facebook/callback`);
    params.append('client_secret', this.clientSecret);
    params.append('code', code);
    console.log('params', params);
    const response = await axios.post(
      'https://graph.facebook.com/v18.0/oauth/access_token',
      params,
      {
        headers: { Accept: 'application/json' },
      },
    );
    console.log('response.data', response.data);
    return response.data.access_token; // Handle the response appropriately
  }
  async getTokenFromCodeID(
      code: string, state: string,
  ): Promise<{ userData: any }> {
    const params = new URLSearchParams();
    params.append('client_id', this.clientId);
    params.append('redirect_uri', `${process.env.IP_HOSTER}/facebook/callback`);
    params.append('client_secret', this.clientSecret);
    params.append('code', code);
    console.log('params', params);
    const response = await axios.post(
        'https://graph.facebook.com/v18.0/oauth/access_token',
        params,
        {
          headers: { Accept: 'application/json' },
        },
    );
    console.log('response.data', response.data);
    return {
      userData: response.data,
    };
  }
  async setSupportedActionsAndEvents() {
    //call get actions and get reactions
    await this.setActions('../../facebook');
    await this.setReactions('../../facebook');
    await this.setQueries('../../facebook');
  }
  // Additional methods as required for Facebook integration

  private generateRandomState(): Promise<string> {
    return new Promise((resolve, reject) => {
      randomBytes(48, (err, buffer) => {
        if (err) {
          reject(err);
        } else {
          resolve(buffer.toString('hex'));
        }
      });
    });
  }
  private async getFacebookAccount({
    userId,
    accountId,
  }: {
    userId?: string;
    accountId?: string;
  }) {
    let facebookAccount;
    if (userId) {
      facebookAccount = await this.prisma.account.findFirst({
        where: {
          userId: userId,
          provider: 'facebook',
        },
      });
    } else if (accountId) {
      facebookAccount = await this.prisma.account.findFirst({
        where: {
          id: accountId,
          provider: 'facebook',
        },
      });
    }
    return facebookAccount;
  }

  async getServiceQuery(
    queryName: string,
    queryProvider: string,
  ): Promise<IQuery | null> {
    try {
      const service = this.serviceManager.getService(queryProvider);
      if (!service) {
        throw new Error('Service not found');
      }
      console.log(`Getting query ${queryName} from provider ${queryProvider}`);
      return await service.getQuery(queryName);
    } catch (error) {
      console.error('Error getting query:', error);
      throw error;
    }
  }

  async fetchFacebookData({
    endpoint,
    jwtToken,
    accountId,
    userID,
    additionalParams = {},
  }: FetchFacebookDataParams): Promise<any> {
    try {
      let facebookAccount;
      console.log('endpoint', endpoint);
      console.log('additionalParams', additionalParams);
      console.log('jwtToken', jwtToken);
      console.log('accountId', accountId);
      console.log('userID', userID);
      if (jwtToken) {
        const decoded = this.jwt.decode(jwtToken);
        const userId = decoded.sub;
        facebookAccount = await this.getFacebookAccount({ userId });
      } else if (accountId) {
        facebookAccount = await this.getFacebookAccount({ accountId });
      } else if (userID) {
        facebookAccount = await this.getFacebookAccount({ userId: userID });
      }
      if (!facebookAccount || !facebookAccount.access_token) {
        throw new Error('facebook account not found or access token missing.');
      }
      // Fetch data from facebook
      const response = await axios.get(`${this.apiBaseUrl}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${facebookAccount.access_token}`,
          'Content-Type': 'application/json',
        },
        params: additionalParams,
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching data from facebook: ${endpoint}`, error);
      throw error;
    }
  }
}
