import { Injectable } from '@nestjs/common';
import {ServiceManagerService} from "../serviceManager/serviceManager.service";
import {JwtService} from "@nestjs/jwt";
import {PrismaService} from "../prisma/prisma.service";
import {RefreshTokenParamsDto} from "../interfaces/refreshToken.interface";
import axios from "axios";
import {BaseAuthService} from "../Base/baseauth/baseauth.service";
interface FetchTimeIoDataParams {
    endpoint: string;
    jwtToken?: string;
    accountId?: string;
    userID?: string;
    additionalParams?: Record<string, any>;
}
interface FetchResultCached {
    cityName: string;
    timestamp: number;
}

@Injectable()
export class TimeioService extends BaseAuthService {
    private cache: FetchResultCached[] = [];

    constructor(
        private serviceManager: ServiceManagerService,
        private jwt: JwtService,
        public prisma: PrismaService,
    ) {
        super(
            '',
            '',
            '',
            'https://timeapi.io/api/Time/',
            prisma,
        );
        console.log('TimeioService constructor');
        this.setSupportedActionsAndEvents();
        this.setIsPublicService(true);
        serviceManager.registerService('timeio', this);

    }

    protected async initializeAccessToken(): Promise<void> {
    }

    generateAuthUrl(): string {
        return '';
    }
    //even if it wont hold any data, we need to create a account in the database for the user we will retrieve the jwt token from the frontend and use it to create a account in the database
    async createAccountFromJwtToken(jwtToken: string): Promise<any> {
        console.log('createAccountFromJwtToken' + jwtToken);
        let email = '';
        let providerAccountId = '';
        let firstName = '';
        let lastName = '';

        const decoded = this.jwt.decode(jwtToken);
        console.log(decoded);
        if (decoded) {
            email = decoded.email;
            providerAccountId = decoded.sub;
            firstName = decoded.given_name;
            lastName = decoded.family_name;
        }

        let user = await this.prisma.user.findUnique({where: {id: providerAccountId}});
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    id: providerAccountId,
                    email,
                    firstName,
                    lastName,
                },
            });
        }
        console.log('user', user);
        let linkedAccount = await this.prisma.account.findFirst({
            where: {userId: user.id, provider: 'timeio'},
        });
        if (!linkedAccount) {
            linkedAccount = await this.prisma.account.create({
                data: {
                    userId: user.id,
                    type: 'oauth',
                    provider: 'timeio',
                    providerAccountId,
                    access_token: jwtToken,
                },
            });
        }

        return linkedAccount;
    }
    async refreshToken({accountId, jwtToken, token}: RefreshTokenParamsDto): Promise<any> {
        return;
    }

    async getDataWithoutTokenId() {
    }

    async gettimeioAccount({userId, accountId}: { userId?: string, accountId?: string }) {

    }
    async setSupportedActionsAndEvents() {
        await this.setActions('../../timeio');
        console.log('actions set :D');
        await this.setReactions('../../timeio');
    }

    async fetchTimeioData({
                                endpoint,
                                jwtToken,
                                accountId,
                                userID,
                                additionalParams = {},
                            }: FetchTimeIoDataParams): Promise<any> {
        try {
        let timeioAccount;
            console.log('endpoint', endpoint);
            console.log('additionalParams', additionalParams);
            console.log('jwtToken', jwtToken);
            console.log('accountId', accountId);
            console.log('userID', userID);

            // Fetch data from timeio using the api base url it doesnt require any token
            // Fetch data from timeio
            const response = await axios.get(
                this.apiBaseUrl + endpoint,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching timeio data:', error);
            throw error;
        }
    }

    private isCacheOutdated(timestamp: number): boolean {
        const cacheValidityDuration = 3600000; // 1 hour in milliseconds
        return (Date.now() - timestamp) > cacheValidityDuration;
    }


}
