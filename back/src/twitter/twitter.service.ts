import { Injectable, OnModuleInit } from '@nestjs/common';
import { TwitterApi } from 'twitter-api-v2';
import { BaseAuthService } from '../Base/baseauth/baseauth.service';
import axios from 'axios';
import * as OAuth from 'oauth-1.0a';
import * as CryptoJS from 'crypto-js';
import { ServiceManagerService } from '../serviceManager/serviceManager.service';
import {RefreshTokenParamsDto} from "../interfaces/refreshToken.interface";
import {PrismaService} from "../prisma/prisma.service";
import {IService} from '../interfaces/iservice.interface';
import {IAction} from "../interfaces/iaction.interface";
import {IReaction} from "../interfaces/ireaction.interface";
import {IQuery} from "../interfaces/iQuerry.interface";
function generateNonce(length: number): string {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

@Injectable()
export class TwitterService extends BaseAuthService  {
  private twitterClient: TwitterApi;
  private oauth: OAuth;
  private callbackUrl: string = `${process.env.IP_HOSTER}/twitter/callback`;

  constructor(
      private serviceManager: ServiceManagerService,
      public prisma: PrismaService,
    ) {
    super(
      process.env.TWITTER_CLIENT_API_KEY, // Consumer Key
      process.env.TWITTER_CLIENT_API_SECRET_KEY, // Consumer Secret
      'https://api.twitter.com/oauth2/token', // OAuth 2.0 Token URL
      'https://api.twitter.com/2', // Twitter API base URL
        prisma,

    );
    // Initialize OAuth 1.0a
    this.setSupportedActionsAndEvents();
    serviceManager.registerService('twitter', this);

  }
  async getServiceQuery(queryName: string, queryProvider: string): Promise<IQuery | null> {
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
  protected async initializeAccessToken(): Promise<void> {
    try {
      const authString = `${this.clientId}:${this.clientSecret}`;
      const authHeader = `Basic ${Buffer.from(authString).toString('base64')}`;
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');

      const response = await axios.post(this.authUrl, params.toString(), {
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      console.log(
        'TwitterService: initializeAccessToken give the acces token :',
        response.data.access_token,
      );
      this.logger.log('Twitter access token successfully obtained.');
    } catch (error) {
      this.logger.error('Failed to get Twitter access token', error);
      throw error;
    }
  }
  async generateAuthUrlOath1(): Promise<string> {
    // Get the request token
    const requestData = {
      url: 'https://api.twitter.com/oauth/request_token',
      method: 'POST',
      data: { oauth_callback: this.callbackUrl },
    };
    const oauth = new OAuth({
      consumer: {
        key: process.env.TWITTER_CLIENT_API_KEY,
        secret: process.env.TWITTER_CLIENT_API_SECRET_KEY,
      },
      signature_method: 'HMAC-SHA1',
      hash_function(baseString, key) {
        return CryptoJS.HmacSHA1(baseString, key).toString(CryptoJS.enc.Base64);
      },
    });



    const authHeader = oauth.toHeader(oauth.authorize(requestData));
    const response = await axios.post(
      requestData.url,
      {},
      {
        headers: {
          Authorization: authHeader.Authorization,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    const params = new URLSearchParams(response.data);
    const token = params.get('oauth_token');
    return `https://api.twitter.com/oauth/authorize?oauth_token=${token}`;
  }
  async getTokenFromCodeOath1(
    oauthToken: string,
    oauthVerifier: string,
  ): Promise<{ accessToken: string; tokenSecret: string }> {
    // This method should exchange oauthToken and oauthVerifier for an access token
    const requestData = {
      url: 'https://api.twitter.com/oauth/access_token',
      method: 'POST',
      data: { oauth_verifier: oauthVerifier, oauth_token: oauthToken },
    };
    //generate a new oath object
    const oauth = new OAuth({
        consumer: {
            key: process.env.TWITTER_CLIENT_API_KEY,
            secret: process.env.TWITTER_CLIENT_API_SECRET_KEY,
        },
        signature_method: 'HMAC-SHA1',
        hash_function(baseString, key) {
            return CryptoJS.HmacSHA1(baseString, key).toString(CryptoJS.enc.Base64);
        },
    });



    const authHeader = oauth.toHeader(oauth.authorize(requestData));
    const response = await axios.post(
      requestData.url,
      {},
      {
        headers: {
          Authorization: authHeader.Authorization,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    const params = new URLSearchParams(response.data);
    const accessToken = params.get('oauth_token');
    const tokenSecret = params.get('oauth_token_secret');
    console.log('accessToken', accessToken);
    console.log('tokenSecret', tokenSecret);

    this.logger.log('Twitter access token successfully obtained.');
    return { accessToken, tokenSecret };
  }
  async getTwitterAccount({
                                      userId,
                                      accountId,
                                    }: {
    userId?: string;
    accountId?: string;
  }) {
    let twitterAccount;
    if (userId) {
      twitterAccount = await this.prisma.account.findFirst({
        where: {
          userId: userId,
          provider: 'twitter',
        },
      });
    } else if (accountId) {
      twitterAccount = await this.prisma.account.findFirst({
        where: {
          id: accountId,
          provider: 'twitter',
        },
      });
    }
    return twitterAccount;
  }
  async  postTweet(message: string, accessToken: string, accessSecret: string): Promise<void> {
    try {
      // Create a new Twitter client with user context

      console.log('accessToken', accessToken);
        console.log('accessSecret', accessSecret);
      const twitterClient = new TwitterApi({
        appKey: process.env.TWITTER_CLIENT_API_KEY,
        appSecret: process.env.TWITTER_CLIENT_API_SECRET_KEY,
        accessToken: accessToken,
        accessSecret: accessSecret,
      });

      // Get client with user context
      const rwClient = twitterClient.readWrite;

      // Post the tweet
      await rwClient.v2.tweet(message);

      console.log('Tweet posted successfully');
    } catch (error) {
      console.error('Error posting tweet:', error);
    }
  }

  async getDataWithoutTokenId(): Promise<any> {
  }
  async refreshToken({accountId, jwtToken, token}: RefreshTokenParamsDto): Promise<any> {
    throw new Error('Method not implemented.');
  }
  async getUserProfile(accessToken: string, accessSecret: string): Promise<any> {
    try {
      const url = 'https://api.twitter.com/2/users/me';
      const method = 'GET';

      // Construct OAuth request data
      const requestData = {
        url: url,
        method: method
      };
      const oauth = new OAuth({
        consumer: {
          key: process.env.TWITTER_CLIENT_API_KEY,
          secret: process.env.TWITTER_CLIENT_API_SECRET_KEY,
        },
        signature_method: 'HMAC-SHA1',
        hash_function(baseString, key) {
          return CryptoJS.HmacSHA1(baseString, key).toString(CryptoJS.enc.Base64);
        },
      });

      // OAuth header
      const authHeader = oauth.toHeader(oauth.authorize(requestData, {
        key: accessToken,
        secret: accessSecret,
      }));

      // Axios request
      const response = await axios.get(url, {
        headers: {
          Authorization: authHeader.Authorization,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
//
      console.log('User profile:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  async setSupportedActionsAndEvents() {
    //call get actions and get reactions
    await this.setActions('../../twitter');
    await this.setReactions('../../twitter');
    console.log('reactions set :D');

  }
}



