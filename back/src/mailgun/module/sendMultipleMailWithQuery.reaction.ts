import { IAction } from "../../interfaces/iaction.interface";
import { ExtraParam } from "../../interfaces/areaExtraParams.interface";
import { MailgunService } from "../mailgun.service";
import {IReaction} from "../../interfaces/ireaction.interface";

export default class SendMultipleMailReaction implements IReaction {
    constructor(private MailgunService: MailgunService) {
    }

    name = 'Send Multiple Mail With Query';
    description = 'Send an email to multiple people with a query result, separate the email with a comma';
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
        },
        {
            name: "queryName",
            type: "query",
            url: "" // URL is not needed here.
        }
    ];

    async performReaction(payload: any): Promise<void> {
        // Implementation to get weather data using OpenWeatherMap's API
        // The payload should contain any necessary information, such as a user ID or a token
        try {
            console.log('SendMultipleMailReaction: performReaction: payload', payload);

            const toList = payload.To.split(',').map(email => email.trim());
            const to = toList.join(','); // Join back into a comma-separated string
            const subject = payload.Subject;
            const text = payload.Text;
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
            const query = await this.MailgunService.getServiceQuery(queryName, queryProvider);
            if (!query) {
                throw new Error('Query not found');
            }

            const queryResult = await query.performQuery(payload);
            console.log('Query result:', queryResult);
            if (!to || !subject || !text) {
                throw new Error('Missing parameters');
            }
            const result = await this.MailgunService.postMailData({
                endpoint: 'messages',
                from: 'Area <automatedBot@myarea.social>',
                to,
                subject,
                text: text + queryResult,
            });
            console.log('result', result);

            return result;

        } catch (error) {
            console.error('Error when trying to get time', error);
            throw error;
        }
    }
}