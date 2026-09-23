import axios from 'axios';
import {IReaction} from "../../interfaces/ireaction.interface";
import {SpotifyService} from "../spotify.service";
export default class SkipTrackReaction implements IReaction {
    constructor(private spotifyService: SpotifyService) {
    }

    name = 'Skip Track';
    description = 'Skip the current track';

    async performReaction(payload: any): Promise<void> {
        // Implementation to skip track using Spotify's Web API
        // The payload should contain any necessary information, such as a user ID or a token
        try {

            const spotifyAccount = await this.spotifyService.prisma.account.findFirst({
                where: {
                    userId: payload.account.userId, provider: 'spotify',
                },
            });
            if (!spotifyAccount || !spotifyAccount.access_token) {
                throw new Error('spotify account not found or access token missing.');
            }
            //need to call refresh token here
            const token = await this.spotifyService.refreshToken({accountId: payload.account.id});

            const response = await axios.post(
                `${this.spotifyService.apiBaseUrl}/me/player/next`,
                {}, // Empty body for POST request
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                },
            );
            if (response.status === 204) {
                console.log('Track skipped successfully');
            } else {
                console.error('Failed to skip track', response);
            }
        } catch (error) {
            console.error('Error when trying to skip track', error);
            throw error;
        }
    }
}
