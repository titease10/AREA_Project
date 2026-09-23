import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { BaseAuthService } from '../Base/baseauth/baseauth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ServiceManagerService } from '../serviceManager/serviceManager.service';
import { RefreshTokenParamsDto } from "../interfaces/refreshToken.interface";
import { randomBytes } from 'crypto';
import {IQuery} from "../interfaces/iQuerry.interface";


interface FetchGithubDataParams {
    endpoint: string;
    jwtToken?: string;
    accountId?: string;
    userID?: string;
    additionalParams?: Record<string, any>;
}
@Injectable()
export class GithubService extends BaseAuthService {
    constructor(
        public prisma: PrismaService,
        private jwt: JwtService,
        private serviceManager: ServiceManagerService,
    ) {
        super(
            process.env.GITHUB_CLIENT_ID,
            process.env.GITHUB_CLIENT_SECRET,
            'https://github.com/login/oauth/authorize', // GitHub's authorization endpoint
            'https://api.github.com', // GitHub's API base URL
            prisma,
        );
        console.log('GithubService constructor');
        this.setSupportedActionsAndEvents();
        serviceManager.registerService('github', this);
        // Additional initialization as required
    }

    // Implement refreshToken method for GitHub
    async refreshToken({accountId, jwtToken, token}: RefreshTokenParamsDto): Promise<any> {
        // Refresh token implementation specific to GitHub
    }

    protected async initializeAccessToken(): Promise<void> {
        // Initialize access token for GitHub
    }

    generateAuthUrl(): string {
        const scopes = ['repo', 'user']; // Adjust scopes as needed
        const redirectUri = `${process.env.IP_HOSTER}/github/callback`;
        const state = this.generateRandomState(); // Implement this method to generate a random string
        console.log('state', state);
        console.log('clientId', this.clientId);
        return `${this.authUrl}?client_id=${this.clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes.join(' ')}&state=${state}`;
    }
    async fetchUserData(accessToken: string): Promise<any> {
        const response = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        return response.data; // Contains user data
    }

    async getDataWithoutTokenId(): Promise<any> {
    }
    async getTokenFromCode(code: string, state: string): Promise<string> {
        // Verify the 'state' parameter here if necessary
        const params = new URLSearchParams();
        params.append('client_id', this.clientId);
        params.append('client_secret', this.clientSecret);
        params.append('code', code);
        const response = await axios.post('https://github.com/login/oauth/access_token', params, {
            headers: { Accept: 'application/json' },
        });
        return response.data.access_token; // Handle the response appropriately
    }

    async setSupportedActionsAndEvents() {
        //call get actions and get reactions
        await this.setActions('../../github');
        await this.setReactions('../../github');
        await this.setQueries('../../github')
    }
    // Additional methods as required for GitHub integration

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
    private async getGithubAccount({userId, accountId}: { userId?: string, accountId?: string }) {
        let githubAccount;
        if (userId) {
            githubAccount = await this.prisma.account.findFirst({
                where: {
                    userId: userId,
                    provider: 'github',
                },
            });
        } else if (accountId) {
            githubAccount = await this.prisma.account.findFirst({
                where: {
                    id: accountId,
                    provider: 'github',
                },
            });
        }
        return githubAccount;
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

    async fetchGithubData({
                               endpoint,
                               jwtToken,
                               accountId,
                               userID,
                               additionalParams = {}
                           }: FetchGithubDataParams): Promise<any> {
        try {
            let githubAccount;
            console.log('endpoint', endpoint);
            console.log('additionalParams', additionalParams);
            console.log('jwtToken', jwtToken);
            console.log('accountId', accountId);
            console.log('userID', userID);
            if (jwtToken) {
                const decoded = this.jwt.decode(jwtToken);
                const userId = decoded.sub;
                githubAccount = await this.getGithubAccount({userId});
            } else if (accountId) {
                githubAccount = await this.getGithubAccount({accountId});
            } else if (userID) {
                githubAccount = await this.getGithubAccount({userId: userID});
            }
            if (!githubAccount || !githubAccount.access_token) {
                throw new Error('github account not found or access token missing.');
            }
            // Fetch data from github
            const response = await axios.get(`${this.apiBaseUrl}${endpoint}`, {
                headers: {
                    Authorization: `Bearer ${githubAccount.access_token}`,
                    'Content-Type': 'application/json',
                },
                params: additionalParams,
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching data from github: ${endpoint}`, error);
            throw error;
        }
    }
}
