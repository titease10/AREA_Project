import axios from 'axios';
import {IReaction} from "../../interfaces/ireaction.interface";
import {DiscordService} from "../discord.service";
import {ExtraParam} from "../../interfaces/areaExtraParams.interface";

export default class postMessage implements IReaction {
    constructor(private discordService: DiscordService) {
    }
    extraParams: ExtraParam[] = [
        {
            name: "channelID",
            type: "select",
            url: `${process.env.IP_HOSTER}/discord/channels`
        },
        {
            name: "message",
            type: "input",
            url: ""
        },
        {
            name: "queryName",
            type: "query",
            url: "" // URL is not needed here.
        }
    ];
    name = 'Post Message';
    description = 'Post a message on the selected channel, select a query to add data to the message';

    async performReaction(payload: any): Promise<void> {
        // Implementation to skip track using Spotify's Web API
        // The payload should contain any necessary information, such as a user ID or a token
        try {

            const discordAccount = await this.discordService.prisma.account.findFirst({
                where: {
                    userId: payload.account.userId, provider: 'discord',
                },
            });
            if (!discordAccount || !discordAccount.access_token) {
                throw new Error('spotify account not found or access token missing.');
            }
            console.log('postMessage: performReaction: payload', payload);
            const channelId = payload.channelID; // This should be provided in the payload
            const message = payload.message;
            const queryName = payload.queryName;
            const queryProvider = payload.queryProvider;
            console.log('devTestReaction: performReaction: queryName', queryName);
            console.log('devTestReaction: performReaction: queryProvider', queryProvider);
            if (!queryName) {
                throw new Error('devTestReaction: performReaction: queryName is not defined');
            }
            if (!queryProvider) {
                throw new Error('devTestReaction: performReaction: queryProvider is not defined');
            }
            const query = await this.discordService.getServiceQuery(queryName, queryProvider);
            if (!query) {
                throw new Error('Query not found');
            }
            console.log('devTestReaction: performReaction: query');
            const queryResult = await query.performQuery(payload);
            console.log('Query result:', queryResult);
            //refresh token
            await this.discordService.refreshToken({accountId: payload.account.id});
            if (payload.actionProvider === "discord") {
                //wait for 0.5 seconds
                await new Promise(resolve => setTimeout(resolve, 500));

            }
            const response = await axios.post(
                `${this.discordService.apiBaseUrl}/channels/${channelId}/messages`,
                {content: message + queryResult}, // Empty body for POST request
                {
                    headers: {
                        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                },
            );

            if (response.status === 204 || response.status === 200) {
                console.log('Message posted successfully');
            } else {
                console.error('Failed to post message', response);
            }

        } catch (error) {
            console.error('Error when trying to skip track', error);
            throw error;
        }
    }
}
