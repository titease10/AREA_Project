import { Injectable } from '@nestjs/common';
import { BaseAuthService } from '../Base/baseauth/baseauth.service';
import axios from "axios";
import {RefreshTokenParamsDto} from "../interfaces/refreshToken.interface";
import {ServiceManagerService} from "../serviceManager/serviceManager.service";
import {PrismaService} from "../prisma/prisma.service";
import {JwtService} from "@nestjs/jwt";

interface FetchairQualityDataParams {
    endpoint: string;
    jwtToken?: string;
    accountId?: string;
    userID?: string;
    additionalParams?: Record<string, any>;
}
interface FetchResultCached {
    cityName: string;
    weatherState: string;
    timestamp: number;
}

@Injectable()
export class airQualityService extends BaseAuthService {
    private cache: FetchResultCached[] = [];

    constructor(
        private serviceManager: ServiceManagerService,
        private jwt: JwtService,
        public prisma: PrismaService,
    ) {
        super(
            process.env.AQICN_API_KEY,
            process.env.AQICN_API_KEY,
            '',
            'https://api.waqi.info/',
            prisma,
        );
        console.log('airQualityService constructor');
        this.setSupportedActionsAndEvents();
        this.setIsPublicService(true);
        serviceManager.registerService('airQuality', this);

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
            where: {userId: user.id, provider: 'airQuality'},
        });
        if (!linkedAccount) {
            linkedAccount = await this.prisma.account.create({
                data: {
                    userId: user.id,
                    type: 'oauth',
                    provider: 'airQuality',
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

    async getairQualityMapAccount({userId, accountId}: { userId?: string, accountId?: string }) {

    }
    isCacheOutdated(timestamp) {
        const cacheValidityDuration = 36000;
        return (Date.now() - timestamp) > cacheValidityDuration;
    }
    async setSupportedActionsAndEvents() {
        await this.setActions('../../airquality');
        console.log('actions set :D');
        await this.setReactions('../../airquality');
        await this.setQueries('../../airquality');
    }
    async fetchairQualityData({ endpoint, additionalParams = {} }: FetchairQualityDataParams): Promise<any> {
        try {
            const cacheKey = additionalParams.q; // Assuming 'q' parameter is the city name
            let cachedData = this.cache.find(c => c.cityName === cacheKey);

            // Check if the cache is outdated, then update the cache
            if (!cachedData || this.isCacheOutdated(cachedData.timestamp)) {
                const response = await axios.get(`${this.apiBaseUrl}${endpoint}`, {
                    params: {
                        ...additionalParams,
                        token: process.env.AQICN_API_KEY // Use API Key from env
                    },
                });

                const airQualityIndex = response.data.data.aqi; // Example: 42, representing the air quality index
                const timestamp = Date.now();

                // Update or add to cache
                if (cachedData) {
                    cachedData.weatherState = airQualityIndex; // Assuming you want to store the air quality index
                    cachedData.timestamp = timestamp;
                } else {
                    this.cache.push({ cityName: cacheKey, weatherState: airQualityIndex, timestamp });
                }

                return response.data;
            }

            // Return cached data if it's valid
            return { data: { aqi: cachedData.weatherState, city: { name: cachedData.cityName } } };
        } catch (error) {
            console.error('Error fetching data from AQICN', error);
            throw error;
        }
    }


}