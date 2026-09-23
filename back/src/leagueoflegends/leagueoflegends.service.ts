import { Injectable } from '@nestjs/common';
import { BaseAuthService } from '../Base/baseauth/baseauth.service';
import axios from "axios";
import {RefreshTokenParamsDto} from "../interfaces/refreshToken.interface";
import {ServiceManagerService} from "../serviceManager/serviceManager.service";
import {PrismaService} from "../prisma/prisma.service";
import {JwtService} from "@nestjs/jwt";

interface FetchleagueOfLegendsDataParams {
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
export class leagueOfLegendsService extends BaseAuthService {
    private cache: FetchResultCached[] = [];

    constructor(
        private serviceManager: ServiceManagerService,
        private jwt: JwtService,
        public prisma: PrismaService,
    ) {
        super(
            process.env.LEAGUE_OF_LEGENDS_API_KEY,
            process.env.LEAGUE_OF_LEGENDS_API_KEY,
            '',
            'https://api.leagueoflegends.org/data/2.5',
            prisma,
        );
        console.log('leagueOfLegendsService constructor');
        this.setSupportedActionsAndEvents();
        this.setIsPublicService(true);
        serviceManager.registerService('leagueoflegends', this);

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
            where: {userId: user.id, provider: 'leagueoflegends'},
        });
        if (!linkedAccount) {
            linkedAccount = await this.prisma.account.create({
                data: {
                    userId: user.id,
                    type: 'oauth',
                    provider: 'leagueoflegends',
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

    async getleagueOfLegendsMapAccount({userId, accountId}: { userId?: string, accountId?: string }) {

    }

    async setSupportedActionsAndEvents() {
        await this.setActions('../../leagueoflegends');
        console.log('actions set :D');
        await this.setReactions('../../leagueoflegends');
        await this.setQueries('../../leagueoflegends');
    }

    async fetchLeagueOfLegendsData({ endpoint, additionalParams = {} }: FetchleagueOfLegendsDataParams): Promise<any> {
        try {
            const cacheKey = additionalParams.q; // Assuming 'q' parameter is the city name
            let cachedData = this.cache.find(c => c.cityName === cacheKey);

            // Check if FirstCheckOfUpdate is true or cache is outdated, then update the cache
            if (this.firstCheckOfUpdate || !cachedData || this.isCacheOutdated(cachedData.timestamp)) {
                const response = await axios.get(`${this.apiBaseUrl}${endpoint}`, {
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
            console.error('Error fetching data from leagueOfLegendsMap', error);
            throw error;
        }
    }

    async fetchLeagueOfLegendsDataShort(endpoint: string): Promise<any> {
        try {
            const response = await axios.get(endpoint, {
                headers: {
                    'X-Riot-Token': process.env.LEAGUE_OF_LEGENDS_API_KEY
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching data from League of Legends:', error);
            throw error;
        }
    }

    async getLastGameData(playerIdOrName: string): Promise<any> {
        try {
            // Replace with the correct endpoint to check if a player is in-game
            // we will guess its the name of the player
            console.log('getLastGameData: playerIdOrName', playerIdOrName);

            const endpoint = `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${playerIdOrName}`;
            console.log('getLastGameData: endpoint', endpoint);
            const response = await this.fetchLeagueOfLegendsDataShort(endpoint);
            //we now have the data of the player
            //we now need to get the current game of the player
            console.log('getLastGameData: response', response);

            if (!response.puuid) {
                throw new Error('getLastGameData: no puuid found');
            }
            const encryptedSummonerId = response.puuid;
            //we will use https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids?start=0&count=1
            //to get the last game of the player
            //we will use https://europe.api.riotgames.com/lol/match/v5/matches/{matchId}
            //to get the data of the game
            const endpoint2 = `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${encryptedSummonerId}/ids?start=0&count=1`;
            console.log('getLastGameData: endpoint2', endpoint2);
            const response2 = await this.fetchLeagueOfLegendsDataShort(endpoint2);
            console.log('getLastGameData: response2', response2);

            //we now have the id of the last game of the player
            //getLastGameData: response2 [ 'EUW1_6756826740' ]
            const gameId = response2[0];
            console.log('getLastGameData: gameId', gameId);
            const endpoint3 = `https://europe.api.riotgames.com/lol/match/v5/matches/${gameId}`;
            const response3 = await this.fetchLeagueOfLegendsDataShort(endpoint3);
            console.log('getLastGameData: response3', response3);
            //we now have the data of the game

            // You might need to parse the response depending on the API's response format
            return response;
        } catch (error) {
            console.error('Error checking if player is in game:', error);
            throw error;
        }
    }
    async getLastGameDataOnlyPlayer(playerIdOrName: string): Promise<any> {
        try {
            // Replace with the correct endpoint to check if a player is in-game
            // we will guess its the name of the player
            console.log('getLastGameData: playerIdOrName', playerIdOrName);

            const endpoint = `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${playerIdOrName}`;
            console.log('getLastGameData: endpoint', endpoint);
            const response = await this.fetchLeagueOfLegendsDataShort(endpoint);
            //we now have the data of the player
            //we now need to get the current game of the player
            console.log('getLastGameData: response', response);

            if (!response.puuid) {
                throw new Error('getLastGameData: no puuid found');
            }
            const encryptedSummonerId = response.puuid;
            //we will use https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids?start=0&count=1
            //to get the last game of the player
            //we will use https://europe.api.riotgames.com/lol/match/v5/matches/{matchId}
            //to get the data of the game
            const endpoint2 = `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${encryptedSummonerId}/ids?start=0&count=1`;
            console.log('getLastGameData: endpoint2', endpoint2);
            const response2 = await this.fetchLeagueOfLegendsDataShort(endpoint2);
            console.log('getLastGameData: response2', response2);

            //we now have the id of the last game of the player
            //getLastGameData: response2 [ 'EUW1_6756826740' ]
            const gameId = response2[0];
            console.log('getLastGameData: gameId', gameId);
            const endpoint3 = `https://europe.api.riotgames.com/lol/match/v5/matches/${gameId}`;
            const response3 = await this.fetchLeagueOfLegendsDataShort(endpoint3);
            //we now have the data of the game
            // we need to in the participants array find the participant with the same puuid as the one we have
            const participants = response3.info.participants;
            let participant = null;
            for (const participant2 of participants) {
                if (participant2.puuid === encryptedSummonerId) {
                    participant = participant2;
                }
            }
            // You might need to parse the response depending on the API's response format
            return {participant: participant, gameId: gameId};
        } catch (error) {
            console.error('Error checking if player is in game:', error);
            throw error;
        }
    }
    private isCacheOutdated(timestamp: number): boolean {
        const cacheValidityDuration = 3600000; // 1 hour in milliseconds
        return (Date.now() - timestamp) > cacheValidityDuration;
    }
    async getAllChampions(): Promise<any> {
        try {
            const endpoint = `https://ddragon.leagueoflegends.com/cdn/13.24.1/data/en_US/champion.json`;
            const response = await this.fetchLeagueOfLegendsDataShort(endpoint);
            //format the response to get only             id: champion.id,
            //             name: champion.name
            const champions = response.data;
            const formattedChampions = [];
            for (const champion in champions) {
                formattedChampions.push({
                    id: champions[champion].key,
                    name: champions[champion].name
                });
            }
            console.log('getAllChampions: formattedChampions', formattedChampions);
            return {items: formattedChampions};
        } catch (error) {
            console.error('Error fetching data from League of Legends:', error);
            throw error;
        }
    }
    //http://ddragon.leagueoflegends.com/cdn/6.24.1/data/en_US/champion.json

}