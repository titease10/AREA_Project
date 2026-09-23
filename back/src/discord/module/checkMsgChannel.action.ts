import { IAction } from "../../interfaces/iaction.interface";
import { ExtraParam } from "../../interfaces/areaExtraParams.interface";
import { DiscordService} from "../discord.service";

export default class NewMessageByChannel implements IAction {
    constructor(private DiscordService: DiscordService) {
    }

    name = 'New message on channel';
    description = 'Triggers when a new message is sent on the selected channel';
    extraParams: ExtraParam[] = [
        {
            name: "channelID",
            type: "select",
            url: `${process.env.IP_HOSTER}/discord/channels`
        }
    ];


    async performAction(payload: any): Promise<Boolean> {
        try {
            console.log('NewMessageByChannel: performAction: payload', payload);
            const discordAccountId = payload.account?.userId;
            console.log('NewMessageByChannel: performAction: discordAccountId', discordAccountId);
            if (!discordAccountId) {
                throw new Error('NewMessageByChannel: performAction: discordAccount.id is undefined');
            }

            const discordAccount = await this.DiscordService.prisma.account.findFirst({
                where: {
                    userId: discordAccountId, provider: 'discord',
                },
            });
            if (!discordAccount || !discordAccount.access_token) {
                throw new Error('discord account not found or access token missing.');
            }

            const channelId = payload.channelID; // This should be provided in the payload
            const botToken = process.env.DISCORD_BOT_TOKEN;

            const lastMessage = await this.DiscordService.fetchFromDiscord({
                endpoint: `/channels/${channelId}/pins`,
                accountId: discordAccount.id,
                additionalParams: { limit: 1 },
                isBot: true,
            });
            console.log('Last message:', lastMessage);

            const comparator = (existingItem, newItem) => {
                return existingItem.id !== newItem.id;
            };

// Check and update the database
            return await this.DiscordService.checkAndUpdateDatabase(
                discordAccountId,
                lastMessage[0],
                'channelDataPing',
                lastMessage[0].id,
                comparator,
                "discord"
            );

        } catch (error) {
            console.error('Error when trying to check for new messages in channel', error);
            throw error;
        }
    }
}