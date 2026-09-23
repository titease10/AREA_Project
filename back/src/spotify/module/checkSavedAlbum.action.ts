import axios from 'axios';
import {IReaction} from "../../interfaces/ireaction.interface";
import {SpotifyService} from "../spotify.service";
import {IAction} from "../../interfaces/iaction.interface";
export default class CompareSavedAlbum implements IAction {
    constructor(private spotifyService: SpotifyService) {}

    name = 'Compare Saved Album';
    description = 'Compare the number of saved albums';

    async performAction(payload: any): Promise<Boolean> {
        try {
            const spotifyAccountId = payload.account?.userId;

            if (!spotifyAccountId) {
                throw new Error('compareSavedAlbum: performAction: spotifyAccount.id is undefined');
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
            const savedAlbums = await this.spotifyService.fetchSpotifyData({ endpoint: '/me/albums', accountId: payload.account.id });
            console.log('Total albums:', savedAlbums.total);

            const comparator = (existingItem, newItem) => {
                return existingItem.total !== newItem.total;
            };
            // Check and update the database
            return await this.spotifyService.checkAndUpdateDatabase(
                spotifyAccountId,
                { total: savedAlbums.total },
                'savedAlbums',
                'savedAlbums',
                comparator,
                "spotify"
            );
        } catch (error) {
            console.error('Error when trying to compare saved albums', error);
            throw error;
        }
    }
}
