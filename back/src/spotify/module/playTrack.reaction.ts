import axios from 'axios';
import { IReaction } from "../../interfaces/ireaction.interface";
import { SpotifyService } from "../spotify.service";
import { ExtraParam } from "../../interfaces/areaExtraParams.interface";

export default class PlayTrackReaction implements IReaction {
    constructor(private spotifyService: SpotifyService) {}

    name = 'Play Track';
    description = 'Play a track on Spotify, be sure to provide the track name';

    extraParams: ExtraParam[] = [
        {
            name: "songName",
            type: "input",
            url: "" // The URL is not needed in this case, as we are going to handle the search in the code.
        }
    ];

    async performReaction(payload: any): Promise<void> {
        try {
            const songName = payload.songName;
            if (!songName) {
                throw new Error('Song name is not provided');
            }

            // Search for the track using Spotify's Search API
            const searchResponse = await this.spotifyService.fetchSpotifyData({
                endpoint: '/search',
                additionalParams: {
                    q: songName,
                    type: 'track',
                    limit: 1,
                },
                accountId: payload.account.id,
            });

            if (searchResponse.tracks.items.length === 0) {
                throw new Error('No tracks found with the provided name');
            }

            // Use the first track's URI from the search results
            const trackUri = searchResponse.tracks.items[0].uri;

            // Play the track using Spotify's Web API
            const playResponse = await axios.put(
                `${this.spotifyService.apiBaseUrl}/me/player/play`,
                { uris: [trackUri] },
                { headers: { Authorization: `Bearer ${payload.account.access_token}` } }
            );

            if (playResponse.status !== 204) {
                console.error('Failed to play track', playResponse);
            }
        } catch (error) {
            console.error('Error when trying to play track', error);
            throw error;
        }
    }
}
