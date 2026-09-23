import {Injectable} from '@nestjs/common';
import axios from 'axios';
import {BaseAuthService} from '../Base/baseauth/baseauth.service';
import {JwtService} from '@nestjs/jwt';
import {PrismaService} from '../prisma/prisma.service';
import {ServiceManagerService} from '../serviceManager/serviceManager.service';
import {RefreshTokenParamsDto} from "../interfaces/refreshToken.interface";
import {IQuery} from "../interfaces/iQuerry.interface";
interface FetchDiscordDataParams {
    endpoint: string;
    jwtToken?: string;
    accountId?: string;
    userID?: string;
    isBot?: boolean;
    additionalParams?: Record<string, any>;
}
@Injectable()
export class DiscordService extends BaseAuthService {
    constructor(
        public prisma: PrismaService,
        private jwt: JwtService,
        private serviceManager: ServiceManagerService,
    ) {
        super(
            process.env.DISCORD_CLIENT_ID,
            process.env.DISCORD_CLIENT_SECRET,
            'https://discord.com/api/oauth2/authorize',
            'https://discord.com/api/v10',
            prisma,
        );
        console.log('DiscordService constructor');
        this.setSupportedActionsAndEvents();
        serviceManager.registerService('discord', this);
    }

    async refreshToken({accountId, jwtToken, token}: RefreshTokenParamsDto): Promise<any> {
        try {
            let discordAccount;
            if (jwtToken) {
                // Fetch account using JWT token
                const decoded = this.jwt.decode(jwtToken);
                discordAccount = await this.prisma.account.findFirst({
                    where: {userId: decoded.sub, provider: 'discord'},
                });
            } else if (accountId) {
                // Fetch account using account ID
                discordAccount = await this.prisma.account.findFirst({
                    where: {id: accountId, provider: 'discord'},
                });
            } else {
                throw new Error('No valid parameter provided for Discord token refresh.');
            }

            if (!discordAccount || !discordAccount.access_token) {
                throw new Error('Discord account not found or access token missing.');
            }

            //check if the token is still valid
            const now = new Date();
            const expires_at = new Date(discordAccount.expires_at * 1000); // Convert to milliseconds
            console.log('now', now);
            console.log('expires_at', expires_at);

            if (now < expires_at) {
                console.log('Access token still valid. No need to refresh.');
                return discordAccount.access_token;
            }

            // Token refresh logic
            const params = new URLSearchParams();
            params.append('grant_type', 'refresh_token');
            params.append('refresh_token', discordAccount.refresh_token);
            const authString = `${process.env.DISCORD_CLIENT_ID}:${process.env.DISCORD_CLIENT_SECRET}`;
            const authHeader = `Basic ${Buffer.from(authString).toString('base64')}`;

            const response = await axios.post(
                'https://discord.com/api/v10/oauth2/token',
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
                where: {id: discordAccount.id},
                data: {
                    access_token: response.data.access_token,
                    expires_at: Math.floor(Date.now() / 1000) + response.data.expires_in,
                },
            });

            this.logger.log('Discord access token successfully refreshed.');
            return response.data.access_token;
        } catch (error) {
            this.logger.error('Failed to refresh Discord access token', error);
            throw error;
        }
    }

    protected async initializeAccessToken(): Promise<void> {

    }

    generateAuthUrl(): string {
        const scopes = ['identify', 'email', 'guilds', 'guilds.join', 'bot', 'connections']; // Add other scopes as needed
        const redirectUri = `${process.env.IP_HOSTER}/discord/callback`;

        return super.generateAuthUrl(scopes, redirectUri);
    }
    async fetchUserGuilds(jwtToken: string): Promise<any> {
        const userGuilds = await this.fetchFromDiscord({
            endpoint: '/users/@me/guilds',
            jwtToken,
        });
        //wait for 1 sec to avoid rate limit
        await new Promise(resolve => setTimeout(resolve, 1000));
        const botGuilds = await this.fetchFromDiscord({
            endpoint: '/users/@me/guilds',
            jwtToken,
            isBot: true,
        });

        const userGuildIds = userGuilds.map(guild => guild.id);
        const botGuildIds = botGuilds.map(guild => guild.id);
        console.log('userGuildIds', userGuildIds);
        console.log('botGuildIds', botGuildIds);
        const guildIds = userGuildIds.filter(guildId => botGuildIds.includes(guildId));
        const guilds = userGuilds.filter(guild => guildIds.includes(guild.id));
        console.log('guilds', guilds);
        return guilds;
        
    }
    async fetchGuildChannelsWithBotPresent(jwtToken: string): Promise<any> {
        //this will be used as we to retrieve in one call the list of chanel
        // we dont need guild id as the bot can only be in one guild that the user is in
        const guilds = await this.fetchUserGuilds(jwtToken);
        console.log('guilds', guilds);
        const guildId = guilds[0].id;
        console.log('guildId', guildId);
        const channels = await this.fetchGuildChannels(guildId, jwtToken);
        console.log('channels', channels);
        return channels;

    }
    async fetchMessagesFromChannel(channelId: string, userId: string): Promise<any> {
        return this.fetchFromDiscord({
            endpoint: `/channels/${channelId}/messages`,
            userID: userId,
            isBot: true,
        });
    }
    async fetchGuildChannels(guildId: string, jwtToken: string): Promise<any> {
        return this.fetchFromDiscord({
            endpoint: `/guilds/${guildId}/channels`,
            jwtToken,
            isBot: true,
        });
    }

    async getTokenFromCodeID(
        code: string,
    ): Promise<{ accessToken: string; idToken: string; userData: any }> {
        const redirectUri = `${process.env.IP_HOSTER}/discord/callback`;
        const response = await this.exchangeAuthorizationCodeForToken(
            code,
            'https://discord.com/api/oauth2/token',
            redirectUri,
        );
        console.log('response', response);

        return {
            accessToken: response.access_token,
            idToken: response.id_token,
            userData: response,
        };
    }

    private async getDiscordAccount({userId, accountId}: { userId?: string, accountId?: string }) {
        let discordAccount;
        if (userId) {
            discordAccount = await this.prisma.account.findFirst({
                where: {
                    userId: userId,
                    provider: 'discord',
                },
            });
        } else if (accountId) {
            discordAccount = await this.prisma.account.findFirst({
                where: {
                    id: accountId,
                    provider: 'discord',
                },
            });
        }
        return discordAccount;
    }
    async fetchFromDiscord({
        endpoint,
        jwtToken,
        accountId,
        userID,
        isBot = false,
        additionalParams = {} }: FetchDiscordDataParams): Promise<any> {
        try {
            let discordAccount;
            console.log('endpoint', endpoint);
            console.log('additionalParams', additionalParams);
            console.log('jwtToken', jwtToken);
            console.log('accountId', accountId);
            console.log('userID', userID);
            if (jwtToken) {
                // Fetch account using JWT token
                const decoded = this.jwt.decode(jwtToken);
                discordAccount = await this.getDiscordAccount({userId: decoded.sub});
            }
            else if (accountId) {
                // Fetch account using account ID
                discordAccount = await this.getDiscordAccount({accountId});
            } else if (userID) {
                discordAccount = await this.getDiscordAccount({userId: userID});
            } else {
                throw new Error('No valid parameter provided for Discord fetch.');
            }
            if (!discordAccount || !discordAccount.access_token) {
                throw new Error('discord account not found or access token missing.');
            }


            const botToken = process.env.DISCORD_BOT_TOKEN; // Retrieve the bot token from environment variables

            if (!botToken) {
                throw new Error('Bot token not found in environment variables.');
            }
            //check if the token is still valid
            const now = new Date();
            const expires_at = new Date(discordAccount.expires_at * 1000); // Convert to milliseconds
            console.log('now', now);
            console.log('expires_at', expires_at);

            if (now > expires_at) {
                console.log('Access token expired. Getting a new one');
                await this.refreshToken({accountId : discordAccount.id});
            }
            console.log(
                'Access token found. Using it : ' + discordAccount.access_token,
            );
            if (isBot) {
                console.log('isBot');
                const response = await axios.get(`${this.apiBaseUrl}${endpoint}`, {
                    headers: {Authorization: `Bot ${botToken}`},
                    params: additionalParams,
                });
                return response.data;
            } else {
                const response = await axios.get(`${this.apiBaseUrl}${endpoint}`, {
                    headers: {Authorization: `Bearer ${discordAccount.access_token}`},
                    params: additionalParams,
                });
                return response.data;
            }

        } catch (error) {
            console.error(`Error fetching data from discord: ${endpoint}`, error);
            throw error;
        }
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
    async fetchFromDiscordWithAccountId(
        endpoint: string,
        accountId: string,
        params = {},
    ): Promise<any> {
        //will do the same as fetchFromdiscord but will use the account id instead of the jwt token
        try {
            // Retrieve the user's discord account from the database
            const discordAccount = await this.prisma.account.findFirst({
                where: {
                    id: accountId,
                },
            });

            if (!discordAccount || !discordAccount.access_token) {
                throw new Error('discord account not found or access token missing.');
            }
            //check if the token is still valid
            const now = new Date();
            const expires_at = new Date(discordAccount.expires_at * 1000); // Convert to milliseconds
            console.log('now', now);
            console.log('expires_at', expires_at);

            if (now > expires_at) {
                console.log('Access token expired. Getting a new one');
                await this.refreshToken({accountId});
            }
            console.log(
                'Access token found. Using it : ' + discordAccount.access_token,
            );
            const response = await axios.get(`${this.apiBaseUrl}${endpoint}`, {
                headers: {
                    Authorization: `Bearer ${discordAccount.access_token}`,
                    'Content-Type': 'application/json',
                },
                params: params,
            });

            return response.data;
        } catch (error) {
            console.error(`Error fetching data from discord: ${endpoint}`, error);
            throw error;
        }
    }

    async getDataWithoutTokenId(): Promise<any> {
        //we will have to make a call to /me to get the user info as we dont have jwt token

    }

    async getDataWithoutTokenIdButAccess(access_token: string): Promise<any> {
        //we will have to make a call to /me to get the user info as we dont have jwt token
        const response = await axios.get(`${this.apiBaseUrl}/oauth2/@me`, {
            headers: {
                Authorization: `Bearer ${access_token}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    }

    async setSupportedActionsAndEvents() {
        //call get actions and get reactions
        await this.setActions('../../discord');
        await this.setReactions('../../discord');
        await this.setQueries('../../discord');
    }

    async getMe(jwtToken: string): Promise<any> {
        return this.fetchFromDiscord({  endpoint: '/users/@me', jwtToken });
    }

}
