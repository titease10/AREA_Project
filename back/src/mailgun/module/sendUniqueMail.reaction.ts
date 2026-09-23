import { IAction } from "../../interfaces/iaction.interface";
import { ExtraParam } from "../../interfaces/areaExtraParams.interface";
import { MailgunService } from "../mailgun.service";
import {IReaction} from "../../interfaces/ireaction.interface";

export default class SendUniqueMailReaction implements IReaction {
    constructor(private MailgunService: MailgunService) {
    }

    name = 'Send Unique Mail';
    description = 'Send an email to a specific person';
    extraParams: ExtraParam[] = [
        {
            name: 'To',
            type: 'input',
            url:""
        },
        {
            name: 'Subject',
            type: 'input',
            url:""
        },
        {
            name: 'Text',
            type: 'input',
            url:""
        }
    ];

    async performReaction(payload: any): Promise<void> {
        // Implementation to get weather data using OpenWeatherMap's API
        // The payload should contain any necessary information, such as a user ID or a token
        try {
            console.log('SendUniqueMailReaction: performReaction: payload', payload);

            const to = payload.To;
            const subject = payload.Subject;
            const text = payload.Text;
            if (!to || !subject || !text) {
                throw new Error('Missing parameters');
            }
            const result = await this.MailgunService.postMailData({
                endpoint: 'messages',
                from: 'Area <automatedBot@myarea.social>',
                to,
                subject,
                text,
            });
            console.log('result', result);

            return result;

        } catch (error) {
            console.error('Error when trying to get time', error);
            throw error;
        }
    }
}