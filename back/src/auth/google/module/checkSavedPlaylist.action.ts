import axios from 'axios';
import { IReaction } from "../../../interfaces/ireaction.interface";
import { GoogleAuthService } from "../googleauth.service";
import { IAction } from "../../../interfaces/iaction.interface";

export default class CompareSavedPlaylists implements IAction {
    constructor(private googleAuthService: GoogleAuthService) {}

    name = 'Compare User Playlists';
    description = 'Check if there are new playlists on YouTube';

    async performAction(payload: any): Promise<Boolean> {
        try {
            // Fetching the user's playlists from YouTube
            const response = await this.googleAuthService.fetchYoutubeData({
                endpoint: 'playlists',
                accountId: payload.account.id,
                additionalParams: {
                    part: 'snippet,contentDetails',
                    mine: 'true'
                }
            });
            console.log('Total playlists:', response.items.length);
            console.log('payload :', payload);

            // Comparator function to determine if an update is needed
            const comparator = (existingItem, newItem) => {
                return existingItem.length !== newItem.length; // Comparing the count of playlists
            };

            // Check and update the database
            return await this.googleAuthService.checkAndUpdateDatabase(
                payload.account.userId,
                response.items,
                'playlist',
                'id',
                comparator,
                "google"
            );
        } catch (error) {
            console.error('Error when trying to compare saved playlists', error);
            throw error;
        }
    }
}
