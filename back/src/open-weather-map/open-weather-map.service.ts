import { Injectable } from '@nestjs/common';
import { BaseAuthService } from '../Base/baseauth/baseauth.service';
import axios from "axios";
import {RefreshTokenParamsDto} from "../interfaces/refreshToken.interface";
import {ServiceManagerService} from "../serviceManager/serviceManager.service";
import {PrismaService} from "../prisma/prisma.service";
import {JwtService} from "@nestjs/jwt";

interface FetchOpenWeatherDataParams {
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
export class OpenWeatherMapService extends BaseAuthService {
    private cache: FetchResultCached[] = [];
    private   weatherOptions = [
        {id: 1, name: "Rain"},
        {id: 2, name: "Clouds"},
        {id: 3, name: "Sunny"},
        {id: 4, name: "Snow"},
        {id: 5, name: "Windy"},
        {id: 6, name: "Clear"},
        {id: 7, name: "Mist"},
        {id: 8, name: "Smoke"},
        {id: 9, name: "Haze"},
        {id: 10, name: "Dust"},
        {id: 11, name: "Fog"},
        {id: 12, name: "Sand"},
        {id: 13, name: "Ash"},
        {id: 14, name: "Squall"},
        {id: 15, name: "Tornado"},
        {id: 16, name: "Drizzle"},
        {id: 17, name: "Thunderstorm"}
    ];
    constructor(
        private serviceManager: ServiceManagerService,
        private jwt: JwtService,
        public prisma: PrismaService,
    ) {
        super(
            process.env.WEATHER_API_KEY,
            process.env.WEATHER_API_KEY,
            '',
            'https://api.openweathermap.org/data/2.5',
            prisma,
        );
        console.log('OpenWeatherMapService constructor');
        this.setSupportedActionsAndEvents();
        this.setIsPublicService(true);
        serviceManager.registerService('openweathermap', this);

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
            where: {userId: user.id, provider: 'openweathermap'},
        });
        if (!linkedAccount) {
            linkedAccount = await this.prisma.account.create({
                data: {
                    userId: user.id,
                    type: 'oauth',
                    provider: 'openweathermap',
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

    async getOpenWeatherMapAccount({userId, accountId}: { userId?: string, accountId?: string }) {

    }
    async getWeatherPossibleWithId(weatherId: string) {
        //use this.weatherOptions
        for (const weather of this.weatherOptions) {
            if (weather.id.toString() === weatherId) {
                return weather.name;
            }
        }
    }
    async setSupportedActionsAndEvents() {
        await this.setActions('../../open-weather-map');
        console.log('actions set :D');
        await this.setReactions('../../open-weather-map');
    }

    async fetchOpenWeatherData({ endpoint, additionalParams = {} }: FetchOpenWeatherDataParams): Promise<any> {
        try {
            const cacheKey = additionalParams.q; // Assuming 'q' parameter is the city name
            let cachedData = this.cache.find(c => c.cityName === cacheKey);

            // Check if FirstCheckOfUpdate is true or cache is outdated, then update the cache
            if (this.firstCheckOfUpdate || !cachedData || this.isCacheOutdated(cachedData.timestamp)) {
                const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${cacheKey}`, {
                    params: {
                        ...additionalParams,
                        appid: process.env.WEATHER_API_KEY // Use API Key from env
                    },
                });

                const weatherState = response.data.weather[0].main; // Example: 'Clear', 'Clouds', etc.
                const timestamp = Date.now();

                // Update or add to cache
                if (cachedData) {
                    cachedData.weatherState = weatherState;
                    cachedData.timestamp = timestamp;
                } else {
                    this.cache.push({ cityName: cacheKey, weatherState, timestamp });
                }

                // Reset FirstCheckOfUpdate flag after updating cache
                return response.data;
            }

            // Return cached data if it's valid
            return { weather: [ { main: cachedData.weatherState } ], cityName: cachedData.cityName };
        } catch (error) {
            console.error('Error fetching data from OpenWeatherMap', error);
            throw error;
        }
    }

    private isCacheOutdated(timestamp: number): boolean {
        const cacheValidityDuration = 3600000; // 1 hour in milliseconds
        return (Date.now() - timestamp) > cacheValidityDuration;
    }

}