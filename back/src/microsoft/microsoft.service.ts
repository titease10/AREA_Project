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

interface FetchMicrosoftDataParams {
    endpoint: string;
    jwtToken?: string;
    accountId?: string;
    userID?: string;
    additionalParams?: Record<string, any>;
}

@Injectable()
export class MicrosoftService extends BaseAuthService {
    constructor(
        public prisma: PrismaService,
        private jwt: JwtService,
        private serviceManager: ServiceManagerService,
    ) {
        super(
            process.env.MICROSOFT_CLIENT_ID,
            process.env.MICROSOFT_CLIENT_SECRET,
            'https://login.microsoftonline.com/common/oauth2/v2.0/authorize', // Microsoft's authorization endpoint
            'https://graph.microsoft.com/v1.0', // Microsoft Graph API base URL
            prisma,
        );

        console.log('MicrosoftService constructor');
        this.setSupportedActionsAndEvents();
        serviceManager.registerService('microsoft', this);
    }
    // Implement refreshToken method for GitHub
    async refreshToken({
                           accountId,
                           jwtToken,
                           token,
                       }: RefreshTokenParamsDto): Promise<any> {
        // Refresh token implementation specific to Microsoft
    }

    protected async initializeAccessToken(): Promise<void> {
        // Initialize access token for Microsoft
    }

    generateAuthUrl(): string {
        const scopes = ['User.Read', 'profile', 'openid', 'email', 'Calendars.ReadWrite' ];
      //nclude a parameter prompt=login to ensure that users are always prompted to log in, which is useful in distinguishing between personal and professional accounts.

        const redirectUri = `${process.env.IP_HOSTER}/microsoft/callback`;
        return super.generateAuthUrl(scopes, redirectUri, 'code');
    }
    generateAdminConsentUrl(): string {
        const tenantId = process.env.MICROSOFT_TENANT_ID;
        return `https://login.microsoftonline.com/${tenantId}/adminconsent?client_id=${
            this.clientId
        }&redirect_uri=${encodeURIComponent(`${process.env.IP_HOSTER}/microsoft/callback`)}`;
    }
    async fetchUserData(accessToken: string): Promise<any> {
        const response = await axios.get('https://graph.microsoft.com/v1.0/me', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        return response.data;
    }


    async getDataWithoutTokenId(): Promise<any> {}
    async getTokenFromCode(code: string, state: string): Promise<any> {
        const params = new URLSearchParams();
        params.append('client_id', this.clientId);
        params.append('scope', 'User.Read');
        params.append('code', code);
        params.append('redirect_uri', `${process.env.IP_HOSTER}/microsoft/callback`);
        params.append('grant_type', 'authorization_code');
        params.append('client_secret', this.clientSecret);

        const response = await axios.post(
            'https://login.microsoftonline.com/common/oauth2/v2.0/token',
            params.toString(),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        console.log('response.data', response.data);
        return response.data;
    }

    async getTokenFromCodeID(
        code: string, state: string,
    ): Promise<{ userData: any }> {
        const params = new URLSearchParams();
        params.append('client_id', this.clientId);
        params.append('redirect_uri', `${process.env.IP_HOSTER}/microsoft/callback`);
        params.append('client_secret', this.clientSecret);
        params.append('code', code);
        console.log('params', params);
        const response = await axios.post(
            'https://graph.microsoft.com/v18.0/oauth/access_token',
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
        await this.setActions('../../microsoft');
        await this.setReactions('../../microsoft');
        await this.setQueries('../../microsoft');
    }
    // Additional methods as required for Microsoft integration

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
    private async getMicrosoftAccount({
                                         userId,
                                         accountId,
                                     }: {
        userId?: string;
        accountId?: string;
    }) {
        let microsoftAccount;
        if (userId) {
            microsoftAccount = await this.prisma.account.findFirst({
                where: {
                    userId: userId,
                    provider: 'microsoft',
                },
            });
        } else if (accountId) {
            microsoftAccount = await this.prisma.account.findFirst({
                where: {
                    id: accountId,
                    provider: 'microsoft',
                },
            });
        }
        return microsoftAccount;
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

    async fetchMicrosoftData({
                                endpoint,
                                jwtToken,
                                accountId,
                                userID,
                                additionalParams = {},
                            }: FetchMicrosoftDataParams): Promise<any> {
        try {
            let microsoftAccount;
            console.log('endpoint', endpoint);
            console.log('additionalParams', additionalParams);
            console.log('jwtToken', jwtToken);
            console.log('accountId', accountId);
            console.log('userID', userID);
            if (jwtToken) {
                const decoded = this.jwt.decode(jwtToken);
                console.log('decoded', decoded);
                const userId = decoded.sub;
                microsoftAccount = await this.getMicrosoftAccount({ userId });
            } else if (accountId) {
                microsoftAccount = await this.getMicrosoftAccount({ accountId });
            } else if (userID) {
                microsoftAccount = await this.getMicrosoftAccount({ userId: userID });
            }
            if (!microsoftAccount || !microsoftAccount.access_token) {
                throw new Error('microsoft account not found or access token missing.');
            }
            // Fetch data from microsoft
            const response = await axios.get(`${this.apiBaseUrl}${endpoint}`, {
                headers: {
                    Authorization: `Bearer ${microsoftAccount.access_token}`,
                    'Content-Type': 'application/json',
                },
                params: additionalParams,
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching data from microsoft: ${endpoint}`, error);
            throw error;
        }
    }
}
