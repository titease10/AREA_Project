import { GoogleAuthService } from "../googleauth.service";
import { IAction } from "../../../interfaces/iaction.interface";
import { ExtraParam } from "../../../interfaces/areaExtraParams.interface";

export default class NewVideoByChannel implements IAction {
    constructor(private googleAuthService: GoogleAuthService) {}

    name = 'New Video By Channel';
    description = 'Check if there are new videos uploaded by a channel on YouTube (enter the channel ID in the field below)';
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
                throw new Error('NewVideoByChannel: performAction: channelId is not defined');
            }

            // Fetching the latest uploaded videos from the specified channel
            const response = await this.googleAuthService.fetchYoutubeData({
                endpoint: 'search',
                accountId: payload.account.id,
                additionalParams: {
                    part: 'snippet',
                    channelId: channelId,
                    order: 'date',
                    type: 'video',
                    maxResults: 5 // Adjust as needed
                }
            });

            console.log('Latest videos:', response.items);

            // Comparator function to determine if there is a new video
            const comparator = (existingVideos, newVideos) => {
                const existingVideoIds = existingVideos.map(item => item.id.videoId);
                const newVideoIds = newVideos.map(item => item.id.videoId);

                // Check for any new video IDs that are not in the existingVideoIds array
                return newVideoIds.some(videoId => !existingVideoIds.includes(videoId));
            };

            // Check and update the database
            return await this.googleAuthService.checkAndUpdateDatabase(
                payload.account.userId,
                response.items,
                'video', // Assuming you have a 'video' field in your database schema
                channelId,
                comparator,
                "google"
            );
        } catch (error) {
            console.error('Error when trying to check for new videos by the channel', error);
            throw error;
        }
    }
}
