import { IQuery } from "../../interfaces/iQuerry.interface";
import { leagueOfLegendsService } from "../leagueoflegends.service";
import { PrismaService } from "../../prisma/prisma.service";
import {ExtraParam} from "../../interfaces/areaExtraParams.interface";

export default class GetLastGameStats implements IQuery {
    constructor(
        private leagueOfLegendsService: leagueOfLegendsService,
        private prismaService: PrismaService
    ) {}

    name = 'Get last game stats';
    description = 'This will return the stats with the following format: {"championName":"Aatrox","win":true,"kills":5,"deaths":3,"assists":5,"kdaRatio":3.33,"totalDamageDealtToChampions":0,"totalMinionsKilled":0,"visionScore":0}';

    extraParams: ExtraParam[] = [
        {
            name: "nameInGame",
            type: "input",
            url: ""
        }
    ];

    async performQuery(payload: any): Promise<string> {
        try {
            if (!payload.nameInGame) {
                throw new Error('Name in game is not defined');
            }

            // Get the last game data for the player
            const { participant } = await this.leagueOfLegendsService.getLastGameDataOnlyPlayer(payload.nameInGame);

            // Calculate the KDA ratio
            const kda = participant.deaths === 0 ? participant.kills + participant.assists : (participant.kills + participant.assists) / participant.deaths;

            // Prepare the stats object
            const stats = {
                championName: participant.championName,
                win: participant.win,
                kills: participant.kills,
                deaths: participant.deaths,
                assists: participant.assists,
                kdaRatio: kda.toFixed(2),
                totalDamageDealtToChampions: participant.totalDamageDealtToChampions,
                totalMinionsKilled: participant.totalMinionsKilled,
                visionScore: participant.visionScore
                // ...add any other stats you want to include
            };
            console.log('Last game stats: ', stats);
            //now create a string with the stats
            const statsString = JSON.stringify(stats);
            return `${payload.nameInGame} last game stats: ${statsString}`;
        } catch (error) {
            console.error('Error when trying to get last game stats', error);
            throw error;
        }
    }
}
