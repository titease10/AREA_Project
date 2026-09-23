import {Injectable} from '@nestjs/common';
import axios from 'axios';
import {BaseAuthService} from '../Base/baseauth/baseauth.service';
import {JwtService} from '@nestjs/jwt';
import {PrismaService} from '../prisma/prisma.service';
import {ServiceManagerService} from '../serviceManager/serviceManager.service';
import {IService} from '../interfaces/iservice.interface';
import {IAction} from "../interfaces/iaction.interface";
import {IReaction} from "../interfaces/ireaction.interface";
import {RefreshTokenParamsDto} from "../interfaces/refreshToken.interface";
import {promises as fs} from 'fs';
import {join} from 'path';
import { ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';

interface FetchSpotifyDataParams {
    endpoint: string;
    jwtToken?: string;
    accountId?: string;
    userID?: string;
    additionalParams?: Record<string, any>;
}

function getNestedProperty(obj, path) {
    return path.split('.').reduce((currentObject, property) => {
        return currentObject ? currentObject[property] : undefined;
    }, obj);
}
@ApiTags('spotify service')
@Injectable()
export class SpotifyService extends BaseAuthService  {
    constructor(
        public prisma: PrismaService,
        private jwt: JwtService,
        private serviceManager: ServiceManagerService,
    ) {
        super(
            process.env.SPOTIFY_CLIENT_ID,
            process.env.SPOTIFY_CLIENT_SECRET,
            'https://accounts.spotify.com/authorize',
            'https://api.spotify.com/v1',
            prisma,
        );
        console.log('SpotifyService constructor');
        this.setSupportedActionsAndEvents();
        serviceManager.registerService('spotify', this);
    }

    async refreshToken({accountId, jwtToken, token}: RefreshTokenParamsDto): Promise<any> {
        try {
            let spotifyAccount;
            if (accountId) {
                // Fetch account using account ID
                spotifyAccount = await this.prisma.account.findFirst({
                    where: {id: accountId},
                });
            } else if (jwtToken) {
                // Fetch account using JWT token
                const decoded = this.jwt.decode(jwtToken);
                const userId = decoded.sub;
                spotifyAccount = await this.prisma.account.findFirst({
                    where: {userId: userId, provider: 'spotify'},
                });
                console.log('spotifyAccount found with jwt token', spotifyAccount);
            } else if (token) {
                // Fetch account using access token
                console.log('token', token);
                spotifyAccount = await this.prisma.account.findFirst({
                    where: {access_token: token, provider: 'spotify'},
                });
                console.log('spotifyAccount found with acces token', spotifyAccount);

            } else {
                throw new Error('No valid parameter provided for token refresh.');
            }

            if (!spotifyAccount || !spotifyAccount.access_token) {
                throw new Error('Spotify account not found or access token missing.');
            }
            //check if the token is still valid and if not, get a new one
            const now = new Date();
            const expires_at = new Date(spotifyAccount.expires_at * 1000);
            //if not necessary to refresh, return the token
            if (now < expires_at) {
                return spotifyAccount.access_token;
            }
            // Token refresh logic (similar for all cases)
            const params = new URLSearchParams();
            params.append('grant_type', 'refresh_token');
            params.append('refresh_token', spotifyAccount.refresh_token);
            const authString = `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`;
            const authHeader = `Basic ${Buffer.from(authString).toString('base64')}`;
            const response = await axios.post(
                'https://accounts.spotify.com/api/token',
                params,
                {
                    headers: {
                        Authorization: authHeader,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                },
            );

            // Update the access token in the database
            await this.prisma.account.update({
                where: {id: spotifyAccount.id},
                data: {
                    access_token: response.data.access_token,
                    expires_at: Math.floor(Date.now() / 1000) + response.data.expires_in,
                },
            });
            this.logger.log('Spotify access token successfully refreshed.');
            return response.data.access_token;
        } catch (error) {
            this.logger.error('Failed to refresh Spotify access token', error);
            throw error;
        }
    }

    protected async initializeAccessToken(): Promise<void> {
        try {
            console.log('initializeAccessToken for spotify');
            const params = new URLSearchParams();
            params.append('grant_type', 'client_credentials');
            const authString = `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`;
            const authHeader = `Basic ${Buffer.from(authString).toString('base64')}`;

            const response = await axios.post(
                'https://accounts.spotify.com/api/token',
                params,
                {
                    headers: {
                        Authorization: authHeader,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                },
            );

            console.log(
                'SPOTIFY: initializeAccessToken give the acces token :',
            );
            this.logger.log('Spotify access token successfully obtained.');
        } catch (error) {
            this.logger.error('Failed to get Spotify access token', error);
            throw error;
        }
    }

    generateAuthUrl(): string {
        const scopes = [
            'user-read-private',
            'user-read-email',
            'user-read-playback-state',
            'user-modify-playback-state',
            'user-library-read',
            'user-library-modify',
            'user-read-recently-played',
            'user-top-read',
            'user-read-playback-position',
            'user-follow-read',
            'user-follow-modify',
            'playlist-modify-public',
            'playlist-modify-private',
            'streaming',
            'app-remote-control',
        ];
        const redirectUri = `${process.env.IP_HOSTER}/spotify/callback`;

        return super.generateAuthUrl(scopes, redirectUri);
    }


    async getTokenFromCodeID(
        code: string,
    ): Promise<{ accessToken: string; idToken: string; userData: any }> {
        const redirectUri = `${process.env.IP_HOSTER}/spotify/callback`;
        const response = await this.exchangeAuthorizationCodeForToken(
            code,
            'https://accounts.spotify.com/api/token',
            redirectUri,
        );
        console.log('response', response);

        return {
            accessToken: response.access_token,
            idToken: response.id_token,
            userData: response,
        };
    }


    async fetchSpotifyData({
                               endpoint,
                               jwtToken,
                               accountId,
                                userID,
                               additionalParams = {}
                           }: FetchSpotifyDataParams): Promise<any> {
        try {
            let spotifyAccount;
            console.log('endpoint', endpoint);
            console.log('additionalParams', additionalParams);
            console.log('jwtToken', jwtToken);
            console.log('accountId', accountId);
            console.log('userID', userID);
            if (jwtToken) {
                // Fetch account using JWT token
                const decoded = this.jwt.decode(jwtToken);
                spotifyAccount = await this.getSpotifyAccount({userId: decoded.sub});
            } else if (accountId) {
                // Fetch account using Account ID
                spotifyAccount = await this.getSpotifyAccount({accountId});
                console.log('spotifyAccount', spotifyAccount);
            } else if (userID) {
                // Fetch account using Account ID
                spotifyAccount = await this.getSpotifyAccount({userId: userID});
                console.log('spotifyAccount', spotifyAccount);

            } else {
                throw new Error('No valid parameters provided for Spotify fetch.');
            }

            if (!spotifyAccount || !spotifyAccount.access_token) {
                throw new Error('Spotify account not found or access token missing.');
            }

            // Check if the token is still valid and refresh if necessary
            const now = new Date();
            const expires_at = new Date(spotifyAccount.expires_at * 1000);
            if (now > expires_at) {
                await this.refreshToken({accountId: spotifyAccount.id});
                // Re-fetch the account to get the updated access token
                spotifyAccount = await this.getSpotifyAccount({accountId: spotifyAccount.id});
            }

            const response = await axios.get(`${this.apiBaseUrl}${endpoint}`, {
                headers: {Authorization: `Bearer ${spotifyAccount.access_token}`},
                params: additionalParams,
            });

            return response.data;
        } catch (error) {
            console.error(`Error fetching data from Spotify: ${endpoint}`, error);
            throw error;
        }
    }

    private async getSpotifyAccount({userId, accountId}: { userId?: string, accountId?: string }) {
        if (userId) {
            return this.prisma.account.findFirst({where: {userId, provider: 'spotify'}});
        } else if (accountId) {
            console.log('accountId in getSpotifyAccount', accountId);
            return this.prisma.account.findFirst({where: {id: accountId}});
        } else {
            throw new Error('No valid parameters provided for fetching Spotify account.');
        }
    }

    async getPlayer(jwtToken: string): Promise<any> {
        await this.fetchSpotifyData({endpoint: '/me/player', jwtToken});
    }

    async getMe(jwtToken: string): Promise<any> {
        return this.fetchSpotifyData({endpoint: '/me', jwtToken});
    }

    async getSongQueue(jwtToken: string): Promise<any> {
        return this.fetchSpotifyData({endpoint: '/me/player/queue', jwtToken});
    }

    async getUserPlaylists(jwtToken: string): Promise<any> {
        const result = await this.fetchSpotifyData({endpoint: '/me/playlists', jwtToken});
        return result;
    }

    async getUserPlaylistsWithAccountId(accountId: string): Promise<any> {
        const result = await this.fetchSpotifyData({endpoint: '/me/playlists', accountId: accountId});
        return result;
    }

    async getPlaylistDetails(jwtToken: string, playlistId: string): Promise<any> {
        return this.fetchSpotifyData({endpoint: `/playlists/${playlistId}`, jwtToken});
    }

    async getPlaylistDetailsWithAccountId(accountId: string, playlistId: string): Promise<any> {
        console.log('accountId', accountId);
        return this.fetchSpotifyData({endpoint: `/playlists/${playlistId}`, accountId: accountId});
    }

    async getSongQueueWithAccountId(accountId: string): Promise<any> {
        return this.fetchSpotifyData({endpoint: '/me/player/queue', accountId: accountId});
    }

    async getRecentlyPlayed(jwtToken: string): Promise<any> {
        return this.fetchSpotifyData({endpoint: '/me/player/recently-played', jwtToken});
    }

    async getRecentlyPlayedWithAccountId(accountId: string): Promise<any> {
        return this.fetchSpotifyData({endpoint: '/me/player/recently-played', accountId: accountId});
    }

    async getDataWithoutTokenId(): Promise<any> {
    }

    async getDataWithoutTokenIdButAccess(access_token: string): Promise<any> {
        //we will have to make a call to /me to get the user info as we dont have jwt token
        const response = await axios.get(`${this.apiBaseUrl}/me`, {
            headers: {
                Authorization: `Bearer ${access_token}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    }

    async setSupportedActionsAndEvents() {
        //call get actions and get reactions
        await this.setActions('../../spotify');
        await this.setReactions('../../spotify');

        await this.setQueries('../../spotify');
    }

}
