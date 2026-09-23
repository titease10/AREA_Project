import { IReaction } from "../../interfaces/ireaction.interface";
import { GithubService } from "../github.service";
import { ExtraParam } from "../../interfaces/areaExtraParams.interface";
import { ServiceManagerService} from "../../serviceManager/serviceManager.service";
import { IQuery } from "../../interfaces/iQuerry.interface";
export default class devTestReaction implements IReaction {
    constructor(private GithubService: GithubService, private serviceManagerService: ServiceManagerService) {
    }

    extraParams: ExtraParam[] = [
        {
            name: "queryName",
            type: "query",
            url: "" // URL is not needed here.
        }
    ];


    name = 'devTest';
    description = 'This will test a query, enter the query name in the field below';
    async performReaction(payload: any): Promise<void> {
        try {
            console.log('devTestReaction: performReaction: payload', payload);
            const queryName = payload.queryName;
            const queryProvider = payload.queryProvider;
            console.log('devTestReaction: performReaction: queryName', queryName);
            console.log('devTestReaction: performReaction: queryProvider', queryProvider);
            if (!queryName) {
                throw new Error('devTestReaction: performReaction: queryName is not defined');
            }
            if (!queryProvider) {
                throw new Error('devTestReaction: performReaction: queryProvider is not defined');
            }
            // Assuming getServiceQuery is a method to fetch the query object by name
            const query = await this.GithubService.getServiceQuery(queryName, queryProvider);
            if (!query) {
                throw new Error('Query not found');
            }
            console.log('devTestReaction: performReaction: query');
            const queryResult = await query.performQuery(payload);
            console.log('Query result:', queryResult);

        } catch (error) {
            console.error('Error in devTestReaction', error);
            throw error;
        }
    }
}
