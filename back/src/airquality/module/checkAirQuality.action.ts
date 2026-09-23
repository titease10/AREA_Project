import { IAction } from "../../interfaces/iaction.interface";
import { ExtraParam } from "../../interfaces/areaExtraParams.interface";
import { airQualityService } from "../airquality.service";
import { PrismaService} from "../../prisma/prisma.service";

export default class checkAirQuality implements IAction {
    constructor(private AirQualityService: airQualityService,
                public prismaService: PrismaService) {
    }

    name = 'Check Air Quality';
    description = 'Check if the air quality is higher than a selected threshold';
    extraParams: ExtraParam[] = [
        {
            name: "city",
            type: "input",
            url:""
        },
        {
            name: "threshold",
            type: "input",
            url:""
        }
    ];

    async performAction(payload: any): Promise<Boolean> {
        try {
            console.log('checkAirQuality: performAction: payload', payload);
            if (!payload.city) {
                throw new Error('City is not defined');
            }
            if (!payload.threshold) {
                throw new Error('Threshold is not defined');
            }

            const airQualityData = await this.AirQualityService.fetchairQualityData({ endpoint: 'feed/' + payload.city });
            console.log('checkAirQuality: performAction: airQualityData', airQualityData);
            const airQualityIndex = airQualityData.data.aqi;
            console.log(`Air quality in ${payload.city}: ${airQualityIndex}`);
            return airQualityIndex > payload.threshold;
        } catch (error) {
            console.error('Error when trying to check air quality', error);
            throw error;
        }
    }
}
