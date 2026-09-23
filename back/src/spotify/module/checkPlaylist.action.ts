import { SpotifyService } from "../spotify.service";
import { IAction } from "../../interfaces/iaction.interface";
import { ExtraParam } from "../../interfaces/areaExtraParams.interface";

export default class GetPlaylistsAction implements IAction {
  constructor(private readonly spotifyService: SpotifyService) {}

  name = 'Check Playlists';
  description = 'Check if changes were made to a selected playlist';

  extraParams: ExtraParam[] = [
    {
      name: "playlistId",
      type: "select",
      url: `${process.env.IP_HOSTER}/spotify/playlists`, // URL to fetch playlist options
    }
  ];
  async performAction(payload: any): Promise<Boolean> {
    try {
      console.log('GetPlaylistsAction: performAction: payload', payload);

      if (!payload.playlistId) {
        throw new Error('GetPlaylistsAction: performAction: playlistId is not defined');
      }
      console.log('GetPlaylistsAction: performAction: playlistId', payload.playlistId);

      // Assuming the first element is the correct one to use
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
      //check if the token is still valid


      console.log('Access token found. Using it : ' + spotifyAccount);


      const currentPlaylist = await this.spotifyService.getPlaylistDetailsWithAccountId(spotifyAccount.id, payload.playlistId);

      const comparator = (existingItem, newItem) => existingItem.tracks.total !== newItem.tracks.total;

      // Check and update the database
      return await this.spotifyService.checkAndUpdateDatabase(spotifyAccountId, currentPlaylist, 'playlists', currentPlaylist.id, comparator, "spotify");
    } catch (error) {
      console.error('Error when trying to get playlists', error);
      throw error;
    }
  }

}

