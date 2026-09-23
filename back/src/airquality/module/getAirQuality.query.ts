import { ExtraParam } from "../../interfaces/areaExtraParams.interface";
import { airQualityService } from "../airquality.service";
import { PrismaService} from "../../prisma/prisma.service";
import { IQuery } from "../../interfaces/iQuerry.interface";

export default class checkAirQuality implements IQuery {
    constructor(private AirQualityService: airQualityService,
                public prismaService: PrismaService) {
    }

    name = 'Get Air Quality';
    description = 'Get the air quality of a city';
    extraParams: ExtraParam[] = [
        {
            name: "city",
            type: "input",
            url:""
        }
    ];

    async performQuery(payload: any): Promise<string> {
        try {
            console.log('checkAirQuality: performAction: payload', payload);
            if (!payload.city) {
                throw new Error('City is not defined');
            }
            const airQualityData = await this.AirQualityService.fetchairQualityData({ endpoint: 'feed/' + payload.city });
            console.log('checkAirQuality: performAction: airQualityData', airQualityData);
            const airQualityIndex = airQualityData.data.aqi;

            console.log(`Air quality in ${payload.city}: ${airQualityIndex}`);
            return `Air quality in ${payload.city}: ${airQualityIndex}`;
        } catch (error) {
            console.error('Error when trying to check air quality', error);
            throw error;
        }
    }
}
