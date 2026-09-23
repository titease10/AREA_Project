import { GoogleAuthService } from "../googleauth.service";
import { IAction } from "../../../interfaces/iaction.interface";
import { ExtraParam } from "../../../interfaces/areaExtraParams.interface";

export default class NewVideoFromSearch implements IAction {
    constructor(private googleAuthService: GoogleAuthService) {}

    name = 'New Video From Search';
    description = 'Check if there are new videos on YouTube based on a search query (enter the search query in the field below)';
    extraParams: ExtraParam[] = [
        {
            name: "searchQuery",
            type: "input",
            url: "" // URL is not needed for a direct input field.
        }
    ];

    async performAction(payload: any): Promise<Boolean> {
        try {
            const query = payload.searchQuery; // Extracting 'searchQuery' from payload
            if (!query) {
                throw new Error('NewVideoFromSearch: performAction: searchQuery is not defined');
            }
            console.log('NewVideoFromSearch: performAction: searchQuery', query);
            console.log('NewVideoFromSearch: performAction: payload', payload);
            // Fetching the search results from YouTube
            const response = await this.googleAuthService.fetchYoutubeData({
                endpoint: 'search',
                accountId: payload.account.id,
                additionalParams: {
                    q: query,
                    type: 'video',
                    order: 'date',
                    part: 'snippet',
                }
            });
            console.log('Total videos:', response.items.length);
            console.log('payload :', payload);
            console.log('response :', response);
            // Comparator function to determine if there are new videos
            const comparator = (existingItems, newItems) => {
                // Assuming existingItems is an array of etags stored in your database
                const existingEtags = existingItems.map(item => item.etag);
                const newEtags = newItems.map(item => item.etag);
                console.log('existingEtags :', existingEtags);
                console.log('newEtags :', newEtags);
                // Check for any new etags that are not in the existingEtags array
                const isNewContentFound = newEtags.some(etag => !existingEtags.includes(etag));

                return isNewContentFound;
            };


            // Check and update the database
            return await this.googleAuthService.checkAndUpdateDatabase(
                payload.account.userId,
                response.items,
                'searchResult',
                'id',
                comparator,
                "google"
            );
        } catch (error) {
            console.error('Error when trying to search new videos', error);
            throw error;
        }
    }
}
