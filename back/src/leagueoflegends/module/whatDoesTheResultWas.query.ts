import { IQuery } from "../../interfaces/iQuerry.interface";
import { leagueOfLegendsService } from "../leagueoflegends.service";
import { PrismaService } from "../../prisma/prisma.service";
import { ExtraParam } from "../../interfaces/areaExtraParams.interface";

export default class GetLastGameOutcome implements IQuery {
    constructor(
        private leagueOfLegendsService: leagueOfLegendsService,
        private prismaService: PrismaService
    ) {}

    name = 'Get last game outcome';
    description = 'This will return the outcome of the last game with the following format: {"win":true}';
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
            const { participant, gameDuration, gameEndTimestamp } = await this.leagueOfLegendsService.getLastGameDataOnlyPlayer(payload.nameInGame);

            // Convert game duration from seconds to a more readable format (e.g., "25m 13s")
            const durationMinutes = Math.floor(gameDuration / 60);
            const durationSeconds = gameDuration % 60;
            const gameDurationFormatted = `${durationMinutes}m ${durationSeconds}s`;

            // Prepare the outcome object
            const outcome = {
                gameDuration: gameDurationFormatted,
                gameEndTimestamp: gameEndTimestamp,
                win: participant.win
            };

            console.log('Last game outcome: ', outcome);
            // Create a string with the outcome
            const outcomeString = JSON.stringify(outcome);
            return outcomeString;
        } catch (error) {
            console.error('Error when trying to get last game outcome', error);
            throw error;
        }
    }
}
