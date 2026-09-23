import { GoogleAuthService } from "../googleauth.service";
import { IAction } from "../../../interfaces/iaction.interface";
import { ExtraParam } from "../../../interfaces/areaExtraParams.interface";

export default class NewSubscription implements IAction {
    constructor(private googleAuthService: GoogleAuthService) {}

    name = 'New Follower';
    description = 'Check if there are new subscribers on YouTube';
    extraParams: ExtraParam[] = [
        {
            name: "channelId",
            type: "input",
            url: "" // URL is not needed for a direct input field.
        }
    ];

    async performAction(payload: any): Promise<Boolean> {
        try {
            const channelId = payload.channelId; // Extracting 'channelId' from payload
            if (!channelId) {
                throw new Error('NewSubscription: performAction: channelId is not defined');
            }

            // Fetching the channel details from YouTube
            const response = await this.googleAuthService.fetchYoutubeData({
                endpoint: 'channels',
                accountId: payload.account.id,
                additionalParams: {
                    part: 'statistics',
                    id: channelId // The specific channel ID to monitor
                }
            });
            console.log('Total channels:', response.items);
            if (response.items.length === 0) {
                throw new Error('Channel not found or access forbidden');
            }

            const currentSubscriberCount = response.items[0].statistics.subscriberCount;
            console.log('Current subscribers:', currentSubscriberCount);

            // Comparator function to determine if there is a change in subscriber count
            const comparator = (existingData, newData) => {
                return existingData.subscriberCount !== newData.subscriberCount;
            };


            // Check and update the database
            return await this.googleAuthService.checkAndUpdateDatabase(
                payload.account.userId,
                { subscriberCount: currentSubscriberCount},
                'channel', // Assuming you have a 'channel' field in your database schema
                channelId,
                comparator,
                "google"
            );
        } catch (error) {
            console.error('Error when trying to check the subscription count of the channel', error);
            throw error;
        }
    }
}
