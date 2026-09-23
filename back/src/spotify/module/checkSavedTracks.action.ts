import axios from 'axios';
import {IReaction} from "../../interfaces/ireaction.interface";
import {SpotifyService} from "../spotify.service";
import {IAction} from "../../interfaces/iaction.interface";
export default class NewSavedTrack implements IAction {
    constructor(private spotifyService: SpotifyService) {}

    name = 'New Saved Track';
    description = 'Check if a new track has been saved';

    async performAction(payload: any): Promise<Boolean> {
        try {
            const spotifyAccountId = payload.account?.userId;
            if (!spotifyAccountId) {
                throw new Error('NewSavedTrack: performAction: spotifyAccount.id is undefined');
            }

            // Fetch the user's saved tracks from Spotify
            const savedTracks = await this.spotifyService.fetchSpotifyData({ endpoint: '/me/tracks', accountId: spotifyAccountId });
            console.log('Total tracks:', savedTracks.total);

            const comparator = (existingItem, newItem) => {
                return existingItem.total !== newItem.total;
            };
            // Check and update the database
            return await this.spotifyService.checkAndUpdateDatabase(
                spotifyAccountId,
                { total: savedTracks.total },
                'savedTracks',
                'savedTracks',
                comparator,
                "spotify"
            );
        } catch (error) {
            console.error('Error when trying to compare saved tracks', error);
            throw error;
        }
    }
}
