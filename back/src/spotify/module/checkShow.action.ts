import { SpotifyService } from '../spotify.service';
import { IAction } from '../../interfaces/iaction.interface';
import { ExtraParam } from '../../interfaces/areaExtraParams.interface';

export default class NewEpisodeFromFollowedShow implements IAction {
  constructor(private readonly spotifyService: SpotifyService) {}

  name = 'New Episode From Followed Show';
    description = 'Check if a new episode has been released from a followed show';
  extraParams: ExtraParam[] = [
    {
      name: 'showId',
      type: 'select',
      url: `${process.env.IP_HOSTER}/spotify/shows`, // URL to fetch show options
    },
  ];

  async performAction(payload: any): Promise<boolean> {
    try {
      console.log(
        'NewEpisodeFromFollowedShow: performAction: payload',
        payload,
      );

      if (!payload.showId) {
        throw new Error(
          'NewEpisodeFromFollowedShow: performAction: showId is not defined',
        );
      }
      console.log(
        'NewEpisodeFromFollowedShow: performAction: showId',
        payload.showId,
      );

      const spotifyAccountId = payload.account?.userId;
      console.log(
        'NewEpisodeFromFollowedShow: performAction: spotifyAccountId',
        spotifyAccountId,
      );

      if (!spotifyAccountId) {
        throw new Error(
          'NewEpisodeFromFollowedShow: performAction: spotifyAccount.id is undefined',
        );
      }

      const spotifyAccount = await this.spotifyService.prisma.account.findFirst(
        {
          where: {
            userId: spotifyAccountId,
            provider: 'spotify',
          },
        },
      );
      if (!spotifyAccount || !spotifyAccount.access_token) {
        throw new Error('Spotify account not found or access token missing.');
      }

      const currentShow = await this.spotifyService.fetchSpotifyData({
        endpoint: '/shows/' + payload.showId,
        accountId: spotifyAccount.id,
      });

      // Define your comparator here based on the show's episodes
      const comparator = (existingItem, newItem) => {
        // Example: Compare the number of episodes
        return existingItem.episodes.total !== newItem.episodes.total;
      };

      // Check and update the database
      return await this.spotifyService.checkAndUpdateDatabase(
        spotifyAccountId,
        currentShow,
        'episodeShows',
        currentShow.id,
        comparator,
        'spotify',
      );
    } catch (error) {
      console.error(
        'Error when trying to check for new episodes from followed shows',
        error,
      );
      throw error;
    }
  }
}
