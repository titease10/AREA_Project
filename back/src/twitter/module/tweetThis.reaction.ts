import { IAction } from "../../interfaces/iaction.interface";
import { ExtraParam } from "../../interfaces/areaExtraParams.interface";
import { TwitterService } from "../twitter.service";
import {IReaction} from "../../interfaces/ireaction.interface";

export default class TweetReaction implements IReaction {
    constructor(private TwitterService: TwitterService) {
    }

    name = 'Tweet This';
    description = 'This will tweet a message, enter the message in the field below';
    extraParams: ExtraParam[] = [
        {
            name: "tweet",
            type: "input",
            url:""
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
            const tweetResult = await this.TwitterService.postTweet(tweet, twitterAccount.access_token, twitterAccount.refresh_token);
            return;
        } catch (error) {
            console.log('TweetAction: performAction: error', error);
            throw error;
        }
    }
}