import { ExtraParam } from "../../interfaces/areaExtraParams.interface";
import { TwitterService } from "../twitter.service";
import {IAction} from "../../interfaces/IAction.interface";

export default class Boringass implements IAction {
    constructor(private TwitterService: TwitterService) {
    }

    name = 'Donothings This';
    description = 'This will tweet a message, enter the message in the field below';
    extraParams: ExtraParam[] = [
        {
            name: "tweet",
            type: "input",
            url:""
        }
    ];

    async performAction(payload: any): Promise<Boolean> {
        try {
            console.log('TweetAction: performAction: payload', payload);
            //check if the minut and hour are correctly defined
    return false;
        } catch (error) {
            console.log('TweetAction: performAction: error', error);
            throw error;
        }
    }
}