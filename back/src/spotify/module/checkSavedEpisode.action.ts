import axios from 'axios';
import {IReaction} from "../../interfaces/ireaction.interface";
import {SpotifyService} from "../spotify.service";
import {IAction} from "../../interfaces/iaction.interface";
export default class NewSavedEpisode  implements IAction {
    constructor(private spotifyService: SpotifyService) {}

    name = 'New Saved Episode';
    description = 'Check if a new episode has been saved';

    async performAction(payload: any): Promise<Boolean> {
        try {
            const spotifyAccountId = payload.account?.userId;

            if (!spotifyAccountId) {
                throw new Error('NewSavedEpisode : performAction: spotifyAccount.id is undefined');
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
            const savedEpisodes = await this.spotifyService.fetchSpotifyData({ endpoint: '/me/episodes', accountId: spotifyAccountId });
            console.log('Total savedEpisodes:', savedEpisodes.total);

            const comparator = (existingItem, newItem) => {
                return existingItem.total !== newItem.total;
            };
            // Check and update the database
            return await this.spotifyService.checkAndUpdateDatabase(
                spotifyAccountId,
                { total: savedEpisodes.total },
                'savedEpisodes',
                'savedEpisodes',
                comparator,
                "spotify"
            );
        } catch (error) {
            console.error('Error when trying to compare saved episode', error);
            throw error;
        }
    }
}
