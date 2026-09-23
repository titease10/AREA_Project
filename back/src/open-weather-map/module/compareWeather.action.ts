import { IAction } from "../../interfaces/iaction.interface";
import { ExtraParam } from "../../interfaces/areaExtraParams.interface";
import { OpenWeatherMapService } from "../open-weather-map.service";

export default class CompareWeatherAction implements IAction {
    constructor(private openWeatherMapService: OpenWeatherMapService) {
    }

    name = 'Compare Weather';
    description = 'Compare the weather of a city with a given weather';
    extraParams: ExtraParam[] = [
        {
            name: "city",
            type: "input",
            url:""
        },
        {
            name: "weather",
            type: "select",
            url:`${process.env.IP_HOSTER}/open-weather-map/weather`
        }
    ];

    async performAction(payload: any): Promise<Boolean> {
        // Implementation to get weather data using OpenWeatherMap's API
        // The payload should contain any necessary information, such as a user ID or a token
        try {
            console.log('CompareWeatherAction: performAction: payload', payload);
            const result = await this.openWeatherMapService.fetchOpenWeatherData({endpoint: '', additionalParams: {q: payload.city}});
            //lets now check if the weather == "cloudy" and if so, return true
            console.log('CompareWeatherAction: performAction: result', result);
            return result.weather[0].main == await this.openWeatherMapService.getWeatherPossibleWithId(payload.weather);

        } catch (error) {
            console.error('Error when trying to get weather data', error);
            throw error;
        }
    }
}