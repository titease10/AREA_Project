import { SpotifyService } from '../spotify.service';
import { IQuery } from '../../interfaces/iQuerry.interface';
import { ExtraParam } from '../../interfaces/areaExtraParams.interface';

export default class getLastSongOfPlaylist implements IQuery {
  constructor(private readonly spotifyService: SpotifyService) {}

  name = 'getLastSongOfPlaylist';
  description = 'Get the last song of a playlist';
  extraParams: ExtraParam[] = [
    {
      name: 'playlistId',
      type: 'select',
      url: `${process.env.IP_HOSTER}/spotify/playlists`, // URL to fetch playlist options
    },
  ];

  async performQuery(payload: any): Promise<string> {
    try {
      const playlistId = payload.playlistId;
      if (!playlistId) {
        throw new Error('Playlist ID is not provided');
      }

      // Fetch the playlist's tracks using Spotify's Web API
      const playlistResponse = await this.spotifyService.fetchSpotifyData({
        endpoint: `/playlists/${playlistId}/tracks`,
        userID: payload.userId,
      });

      if (playlistResponse.items.length === 0) {
        throw new Error('No tracks found in the playlist');
      }

      // Use the last track's URI from the search results
      console.log('Last song of playlist: ', playlistResponse.items[0].track);
      const trackUri = playlistResponse.items[playlistResponse.items.length - 1].track.name;
        console.log('Last song of playlist: ', trackUri);

      return trackUri;
    } catch (error) {
      console.error('Error when trying to get last song of playlist', error);
      throw error;
    }
  }
}
