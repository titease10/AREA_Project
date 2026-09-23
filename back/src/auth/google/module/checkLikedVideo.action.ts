import { GoogleAuthService } from "../googleauth.service";
import { IAction } from "../../../interfaces/iaction.interface";
import { ExtraParam } from "../../../interfaces/areaExtraParams.interface";

export default class NewLikedVideo implements IAction {
    constructor(private googleAuthService: GoogleAuthService) {}

    name = 'New Liked Video';
    description = 'Check if there are new liked videos on YouTube';

    async performAction(payload: any): Promise<Boolean> {
        try {
            // Fetching the user's liked videos from YouTube

            console.log('payload :', payload);
            console.log('LL :', `LL${payload.account.id}`);
            const response = await this.googleAuthService.fetchYoutubeData({
                endpoint: 'playlistItems',
                accountId: payload.account.id,
                additionalParams: {
                    part: 'snippet',
                    playlistId: "LL",
                    maxResults: 50 // You can adjust the number of results as needed

                }
            });

            console.log('Total liked videos:', response.items.length);

            // Comparator function to determine if there are new liked videos
            const comparator = (existingItems, newItems) => {
                const existingVideoIds = existingItems.map(item => item.snippet.resourceId.videoId);
                const newVideoIds = newItems.map(item => item.snippet.resourceId.videoId);

                // Check for any new video IDs that are not in the existingVideoIds array
                const isNewVideoFound = newVideoIds.some(videoId => !existingVideoIds.includes(videoId));

                return isNewVideoFound;
            };

            // Check and update the database
            return await this.googleAuthService.checkAndUpdateDatabase(
                payload.account.userId,
                response.items,
                'likedVideos', // Assuming you have a 'likedVideos' field in your database schema
                'id',
                comparator,
                "google"
            );
        } catch (error) {
            console.error('Error when trying to fetch liked videos', error);
            throw error;
        }
    }
}
