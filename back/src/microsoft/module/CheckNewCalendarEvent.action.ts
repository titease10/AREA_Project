import { IAction } from "../../interfaces/iaction.interface";
import { ExtraParam } from "../../interfaces/areaExtraParams.interface";
import { MicrosoftService} from "../microsoft.service";

export default class checkNewCalendarEvent implements IAction {
    constructor(private MicrosoftService: MicrosoftService) {
    }

    name = 'checkNewCalendarEvent?';
    description = 'Check if you changed your display name';
   // displayName

    async performAction(payload: any): Promise<Boolean> {
        try {
            console.log('checkNewCalendarEvent: performAction: payload', payload);
            const microsoftAccountId = payload.account?.userId;
            console.log('checkNewCalendarEvent: performAction: microsoftAccountId', microsoftAccountId);
            if (!microsoftAccountId) {
                throw new Error('checkNewCalendarEvent: performAction: microsoftAccount.id is undefined');
            }

            const microsoftAccount = await this.MicrosoftService.prisma.account.findFirst({
                where: {
                    userId: microsoftAccountId, provider: 'microsoft',
                },
            });
            if (!microsoftAccount || !microsoftAccount.access_token) {
                throw new Error('discord account not found or access token missing.');
            }

            const myEvents = await this.MicrosoftService.fetchMicrosoftData({
                endpoint: '/me/events?$select=subject,body,bodyPreview,organizer,attendees,start,end,location',
                userID: microsoftAccountId,
                additionalParams: {},
            });
            const comparator = (existingEvents, newEvents) => {
                // Assuming both existingEvents and newEvents are arrays of event objects
                let isNewOrUpdatedEventFound = false;

                for (let newEvent of newEvents) {
                    const existingEvent = existingEvents.find(e => e.id === newEvent.id);

                    if (!existingEvent) {
                        // New event found
                        isNewOrUpdatedEventFound = true;
                        break;
                    } else {
                        // Check if any details of the event have changed
                        if (existingEvent.subject !== newEvent.subject ||
                            existingEvent.start.dateTime !== newEvent.start.dateTime ||
                            existingEvent.end.dateTime !== newEvent.end.dateTime ||
                            existingEvent.location.displayName !== newEvent.location.displayName) {
                            // An existing event has been updated
                            isNewOrUpdatedEventFound = true;
                            break;
                        }
                    }
                }

                return isNewOrUpdatedEventFound;
            }


            // Check and update the database
            return await this.MicrosoftService.checkAndUpdateDatabase(
                microsoftAccountId,
                myEvents.value,
                'calendarEvents',
                myEvents.value.id,
                comparator,
                "microsoft"
            );

        } catch (error) {
            console.error('Error when trying to check for new messages in channel', error);
            throw error;
        }
    }
}