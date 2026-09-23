import { IAction } from "../../interfaces/iaction.interface";
import { ExtraParam } from "../../interfaces/areaExtraParams.interface";
import { TimeioService } from "../timeio.service";

export default class thisTimeIsNotReached implements IAction {
    constructor(private TimeioService: TimeioService) {
    }

    name = 'does we have not reached the time';
    description = 'Compare the time with a given time, be aware that the time is in UTC. enter the city and the zone in the fields below';
    extraParams: ExtraParam[] = [
        {
            name: "city",
            type: "input",
            url:""
        },
        {
            name: "zone",
            type: "input",
            url:"",
        },
        {
            name: "hours",
            type: "input",
            url:"",
        },
        {
            name: "minutes",
            type: "input",
            url:"",
        }
    ];

    async performAction(payload: any): Promise<Boolean> {
        // Implementation to get weather data using OpenWeatherMap's API
        // The payload should contain any necessary information, such as a user ID or a token
        try {
            console.log('thisTimeIsNotReached: performAction: payload', payload);
            //check if the minut and hour are correctly defined
            if (!payload.city) {
                throw new Error('thisTimeIsNotReached: performAction: city is not defined');
            }
            if (!payload.zone) {
                throw new Error('thisTimeIsNotReached: performAction: zone is not defined');
            }
            //check if the minut and hour are correctly defined
            if (!payload.hours || payload.hours > 24 || payload.hours < 0) {
                throw new Error('thisTimeIsNotReached: performAction: hours is not defined');
            }
            if (!payload.minutes || payload.minutes > 60 || payload.minutes < 0) {
                throw new Error('thisTimeIsNotReached: performAction: minutes is not defined');
            }
            //https://timeapi.io/api/Time/current/zone?timeZone=Europe/Amsterdam
            //this is the final url we want to call
            // the endpoint is /current/zone and the additionalParams are {timeZone: Europe/Amsterdam}
            const result = await this.TimeioService.fetchTimeioData({ endpoint: `current/zone` + `?timeZone=`+ payload.zone +`/`+ payload.city});
            //lets now check if the weather == "cloudy" and if so, return true
            console.log('thisTimeIsNotReached: performAction: result', result);
            const hours = payload.hours;
            const minutes = payload.minutes;
            const date = new Date();
            const currentHours = date.getHours();
            const currentMinutes = date.getMinutes();
            //we want to check if we are bwt 00h00 and the time in the payload if so we return true
            return currentHours < hours || (currentHours == hours && currentMinutes < minutes);

        } catch (error) {
            console.error('Error when trying to get time', error);
            throw error;
        }
    }
}