import axios from 'axios';
import { IAction } from '../../interfaces/iaction.interface';
import { SpotifyService } from '../spotify.service';

export default class CompareSavedShow implements IAction {
    constructor(private spotifyService: SpotifyService) {}

    name = 'Compare Saved Show';
    description = 'Compare the number of saved shows';

    async performAction(payload: any): Promise<Boolean> {
        try {
            // Fetch the user's followed shows from Spotify
            console.log('GetPlaylistsAction: performAction: payload', payload);
            const spotifyAccountId = payload.account?.userId;
            console.log('GetPlaylistsAction: performAction: spotifyAccountId', spotifyAccountId);

            if (!spotifyAccountId) {
                throw new Error('GetPlaylistsAction: performAction: spotifyAccount.id is undefined');
            }
            //go get the user in db and check if the token is still valid             return this.prisma.account.findFirst({where: {id: accountId}});
            const spotifyAccount = await this.spotifyService.prisma.account.findFirst({
                where: {
                    userId: spotifyAccountId, provider: 'spotify',
                },
            });
            if (!spotifyAccount || !spotifyAccount.access_token) {
                throw new Error('spotify account not found or access token missing.');
            }
            const savedShows = await this.spotifyService.fetchSpotifyData({ endpoint: '/me/shows', accountId: payload.account.id });
            console.log('Total shows:', savedShows.total);

            // Define a comparator function to determine if there's a change in followed shows
            const comparator = (existingItem, newItem) => {
                return existingItem.total !== newItem.total;
            };

            // Check and update the database with the latest followed shows
            return await this.spotifyService.checkAndUpdateDatabase(
                spotifyAccountId,
                { total: savedShows.total },
                'savedShows',
                'savedShows',
                comparator,
                "spotify"
            );
        } catch (error) {
            console.error('Error when trying to compare saved shows', error);
            throw error;
        }
    }
}
