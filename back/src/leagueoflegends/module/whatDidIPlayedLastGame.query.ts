import { IAction } from "../../interfaces/iaction.interface";
import { ExtraParam } from "../../interfaces/areaExtraParams.interface";
import { leagueOfLegendsService } from "../leagueoflegends.service";
import { PrismaService} from "../../prisma/prisma.service";
import {IQuery} from "../../interfaces/iQuerry.interface";

export default class whatDidWePlayedLastGame implements IQuery {
    constructor(private LeagueOfLegendsService: leagueOfLegendsService,
                public prismaService: PrismaService) {

    }

    name = 'What did i played last time?';
    description = 'This will return the champion you played last time, enter your name in the field below';
    extraParams: ExtraParam[] = [
        {
            name: "nameInGame",
            type: "input",
            url:""
        }
    ];

    async performQuery(payload: any): Promise<string> {
        //            const result = await this.leagueOfLegendsService.getLastGameDataOnlyPlayer(playerIdOrName);

        try {
            console.log('didIPlayed: performAction: payload', payload);
            if (!payload.nameInGame) {
                throw new Error('didIPlayed: performAction: nameInGame is not defined');
            }

            const {participant, gameId} = await this.LeagueOfLegendsService.getLastGameDataOnlyPlayer(payload.nameInGame);
            // now we can update the action
            //now we can see the name of the champion the player played
            const championId = participant.championName;
            console.log('didIPlayed: performAction: championId', championId);
            return `${payload.nameInGame} played ${championId} in his last game`;
        } catch (error) {
            console.error('Error when trying to get weather data', error);
            throw error;
        }
    }
}