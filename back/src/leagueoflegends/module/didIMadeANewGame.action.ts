import { IAction } from "../../interfaces/iaction.interface";
import { ExtraParam } from "../../interfaces/areaExtraParams.interface";
import { leagueOfLegendsService } from "../leagueoflegends.service";
import { PrismaService} from "../../prisma/prisma.service";

export default class didIMadeANewGame implements IAction {
    constructor(private LeagueOfLegendsService: leagueOfLegendsService,
                public prismaService: PrismaService) {

    }

    name = 'Did i finish a new game?';
    description = 'Check if you finished a new game, enter your name in the field below';
    extraParams: ExtraParam[] = [
        {
            name: "nameInGame",
            type: "input",
            url:""
        }
    ];

    async performAction(payload: any): Promise<Boolean> {
        //            const result = await this.leagueOfLegendsService.getLastGameDataOnlyPlayer(playerIdOrName);

        try {
            console.log('didIMadeANewGame: performAction: payload', payload);
            if (!payload.nameInGame) {
                throw new Error('didIMadeANewGame: performAction: nameInGame is not defined');
            }
            if (!payload.actionID) {
                throw new Error('didIMadeANewGame: performAction: actionID is not defined');
            }

            console.log('didIMadeANewGame: performAction: payload.nameInGame', payload.nameInGame);
            const {participant, gameId} = await this.LeagueOfLegendsService.getLastGameDataOnlyPlayer(payload.nameInGame);
            // now we can update the action
            if (!payload.lastGameId) {
                const action = await this.LeagueOfLegendsService.getAreaWithID(payload.actionID);
                console.log('THERE WASNT A LAST GAME ID');
                const actionParams = action.actionParams;
                //now we can parse it didIMadeANewGame: performAction: actionParams {"nameInGame":"TokyoVania","selectChamp":"266"}
                if (!actionParams) {
                    throw new Error('didIMadeANewGame: performAction: actionParams is not defined');
                }
                const actionParamsParsed = JSON.parse(actionParams);
                actionParamsParsed.lastGameId = gameId;
                await this.LeagueOfLegendsService.addFieldToActionOrReaction(payload.actionID, true, 'actionParams', JSON.stringify(actionParamsParsed));
            } else {
                if (payload.lastGameId === gameId) {
                    console.log('didIMadeANewGame: performAction: participant.championId', participant);

                    console.log('didIMadeANewGame: performAction: same game id');
                    return false;
                }
            }
            //now we can update the action
            console.log('didIMadeANewGame: performAction: participant.championId', participant.win);

            return true;
        } catch (error) {
            console.error('Error when trying to get weather data', error);
            throw error;
        }
    }
}