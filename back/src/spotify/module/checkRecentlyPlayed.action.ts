import axios from 'axios';
import {IReaction} from "../../interfaces/ireaction.interface";
import {SpotifyService} from "../spotify.service";
import {IAction} from "../../interfaces/iaction.interface";
export default class GetRecentlyPlayedAction implements IAction {
    constructor(private spotifyService: SpotifyService) {
    }

    name = 'Get Recently Played';
    description = 'Get recently played tracks';

    async performAction(payload: any): Promise<Boolean> {
        // Implementation to get recently played tracks using Spotify's Web API
        // The payload should contain any necessary information, such as a user ID or a token
        try {
            return false;
        } catch (error) {
            console.error('Error when trying to get recently played tracks', error);
            throw error;
        }
    }
}

