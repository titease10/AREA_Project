import axios from 'axios';
import { IReaction } from "../../interfaces/ireaction.interface";
import { MicrosoftService } from "../microsoft.service";
import { ExtraParam } from "../../interfaces/areaExtraParams.interface";

export default class CreateCalendarEventReaction implements IReaction {
    constructor(private microsoftService: MicrosoftService) {}

    name = 'Create Calendar Event';
    description = 'Create an event in the Outlook calendar';

    extraParams: ExtraParam[] = [
        {
            name: "eventTitle",
            type: "input",
            url: ""
        },
        {
            name: "startTime",
            type: "input",
            url: ""
        },
        {
            name: "endTime",
            type: "input",
            url: ""
        },
        {
            name: "location",
            type: "input",
            url: ""
        }
        // Add other parameters as needed (e.g., description, attendees)
    ];

    async performReaction(payload: any): Promise<void> {
        try {
            const eventTitle = payload.eventTitle;
            const startTime = payload.startTime; // ISO 8601 format
            const endTime = payload.endTime; // ISO 8601 format
            const location = payload.location;

            if (!eventTitle || !startTime || !endTime) {
                throw new Error('Required event details are not provided');
            }

            const createEventPayload = {
                subject: eventTitle,
                start: {
                    dateTime: startTime,
                    timeZone: "UTC" // Adjust time zone as necessary
                },
                end: {
                    dateTime: endTime,
                    timeZone: "UTC" // Adjust time zone as necessary
                },
                location: {
                    displayName: location
                }
                // Add other event details as needed
            };

            // Create the event using Microsoft Graph API
            const createResponse = await axios.post(
                `${this.microsoftService.apiBaseUrl}/me/events`,
                createEventPayload,
                { headers: { Authorization: `Bearer ${payload.account.access_token}` } }
            );

            if (createResponse.status !== 201) {
                console.error('Failed to create calendar event', createResponse);
            }
        } catch (error) {
            console.error('Error when trying to create calendar event', error);
            throw error;
        }
    }
}
