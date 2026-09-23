import { IAction } from "../../interfaces/iaction.interface";
import { MicrosoftService } from "../microsoft.service";

export default class CheckCalendarEventForTodayAction implements IAction {
    constructor(private MicrosoftService: MicrosoftService) {}

    name = 'CheckCalendarEventForToday';
    description = 'Check if there is a calendar event scheduled for today';

    async performAction(payload: any): Promise<Boolean> {
        try {
            console.log('CheckCalendarEventForTodayAction: performAction: payload', payload);
            const microsoftAccountId = payload.account?.userId;
            if (!microsoftAccountId) {
                throw new Error('Microsoft account ID is undefined');
            }


            const microsoftAccount = await this.MicrosoftService.prisma.account.findFirst({
                where: {
                    userId: microsoftAccountId, provider: 'microsoft',
                },
            });
            if (!microsoftAccount || !microsoftAccount.access_token) {
                throw new Error('discord account not found or access token missing.');
            }


            // Get the current date in a format compatible with the Microsoft Graph API
            const today = new Date().toISOString().split('T')[0];

            // Fetch events for the current day
            const endpoint = `/me/calendarview?startDateTime=${today}T00:00:00&endDateTime=${today}T23:59:59&$select=subject,start,end`;
            const myEvents = await this.MicrosoftService.fetchMicrosoftData({
                endpoint: endpoint,
                userID: microsoftAccountId,
                additionalParams: {},
            });
            console.log('myEvents :', myEvents);
            // Check if there are any events for today
            return myEvents.value.length > 0;

        } catch (error) {
            console.error('Error in CheckCalendarEventForTodayAction', error);
            throw error;
        }
    }
}
