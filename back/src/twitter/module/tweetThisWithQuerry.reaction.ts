import { IAction } from "../../interfaces/iaction.interface";
import { ExtraParam } from "../../interfaces/areaExtraParams.interface";
import { TwitterService } from "../twitter.service";
import {IReaction} from "../../interfaces/ireaction.interface";

export default class TweetQuerryReaction implements IReaction {
    constructor(private TwitterService: TwitterService) {
    }

    name = 'Tweet This With Querry';
    description = 'This will tweet a message, enter the message in the field below';
    extraParams: ExtraParam[] = [
        {
            name: "tweet",
            type: "input",
            url:""
        },
        {
            name: "queryName",
            type: "query",
            url: "" // URL is not needed here.
        }
    ];

    async performReaction(payload: any): Promise<void> {
        try {
            console.log('TweetAction: performAction: payload', payload);
            //check if the minut and hour are correctly defined
            const tweet = payload.tweet;
            if (!tweet) {
                throw new Error('TweetAction: performAction: tweet is not defined');
            }
            //check account id
            const twitterAccount = await this.TwitterService.getTwitterAccount({ userId: payload.userId });
            if (!twitterAccount) {
                throw new Error('Twitter account not found');
            }
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
            const query = await this.TwitterService.getServiceQuery(queryName, queryProvider);
            if (!query) {
                throw new Error('Query not found');
            }

            const queryResult = await query.performQuery(payload);
            console.log('Query result:', queryResult);

            const tweetResult = await this.TwitterService.postTweet(tweet  + queryResult
                , twitterAccount.access_token, twitterAccount.refresh_token);
            return;
        } catch (error) {
            console.log('TweetAction: performAction: error', error);
            throw error;
        }
    }
}