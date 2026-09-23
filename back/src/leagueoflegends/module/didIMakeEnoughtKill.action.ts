import { IAction } from "../../interfaces/iaction.interface";
import { ExtraParam } from "../../interfaces/areaExtraParams.interface";
import { leagueOfLegendsService } from "../leagueoflegends.service";
import { PrismaService} from "../../prisma/prisma.service";

export default class didIMakeEnoughtKill implements IAction {
    constructor(private LeagueOfLegendsService: leagueOfLegendsService,
                public prismaService: PrismaService) {

    }

    name = 'did I make enought kill?';
    description = 'Check if you made enought kill in your last game, enter your name in the field below and your objective kill';
    extraParams: ExtraParam[] = [
        {
            name: "objectiveKills",
            type: "input",
            url:""
        },
        {
            name: "nameInGame",
            type: "input",
            url:""
        }
    ];

    async performAction(payload: any): Promise<Boolean> {
        //            const result = await this.leagueOfLegendsService.getLastGameDataOnlyPlayer(playerIdOrName);

        try {
            console.log('didIPlayed: performAction: payload', payload);
            if (!payload.nameInGame) {
                throw new Error('didIPlayed: performAction: nameInGame is not defined');
            }
            if (!payload.actionID) {
                throw new Error('didIPlayed: performAction: actionID is not defined');
            }
            if (!payload.objectiveKills) {
                throw new Error('didIPlayed: performAction: objectiveKills is not defined');
            }

            console.log('didIPlayed: performAction: payload.nameInGame', payload.nameInGame);
            const {participant, gameId} = await this.LeagueOfLegendsService.getLastGameDataOnlyPlayer(payload.nameInGame);
            // now we can update the action
            if (!payload.lastGameId) {
                const action = await this.LeagueOfLegendsService.getAreaWithID(payload.actionID);
                console.log('THERE WASNT A LAST GAME ID');
                const actionParams = action.actionParams;
                //now we can parse it didIPlayed: performAction: actionParams {"nameInGame":"TokyoVania","selectChamp":"266"}
                if (!actionParams) {
                    throw new Error('didIPlayed: performAction: actionParams is not defined');
                }
                const actionParamsParsed = JSON.parse(actionParams);
                actionParamsParsed.lastGameId = gameId;
                await this.LeagueOfLegendsService.addFieldToActionOrReaction(payload.actionID, true, 'actionParams', JSON.stringify(actionParamsParsed));
            } else {
                if (payload.lastGameId === gameId) {
                    console.log('didIPlayed: performAction: participant.championId', participant);

                    console.log('didIPlayed: performAction: same game id');
                    return false;
                }
            }
            //now we can update the action
            console.log('didIPlayed: performAction: payload.selectChamp', payload.objectiveKills);
            console.log('didIPlayed: performAction: participant.championId', participant.kills);
            //didIPlayed: performAction: payload.selectChamp 777
            // didIPlayed: performAction: participant.championId 777

            const objectiveKills = String(payload.objectiveKills).trim();
            const participantKills = String(participant.kills).trim();

            console.log('Comparing:', objectiveKills, 'to', participantKills);

            if (objectiveKills <= participantKills) {
                console.log('They match!');
                return true;
            } else {
                console.log('No match found.');
                return false;
            }

            return false;
        } catch (error) {
            console.error('Error when trying to get weather data', error);
            throw error;
        }
    }
}