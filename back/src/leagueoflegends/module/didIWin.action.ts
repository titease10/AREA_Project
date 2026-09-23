import { IAction } from "../../interfaces/iaction.interface";
import { ExtraParam } from "../../interfaces/areaExtraParams.interface";
import { leagueOfLegendsService } from "../leagueoflegends.service";
import { PrismaService} from "../../prisma/prisma.service";

export default class didIWin implements IAction {
    constructor(private LeagueOfLegendsService: leagueOfLegendsService,
                public prismaService: PrismaService) {

    }

    name = 'did I Win?';
    description = 'Check if you won your last game, enter your name in the field below';
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
            console.log('didIWin: performAction: payload', payload);
            if (!payload.nameInGame) {
                throw new Error('didIWin: performAction: nameInGame is not defined');
            }
            if (!payload.actionID) {
                throw new Error('didIWin: performAction: actionID is not defined');
            }

            console.log('didIWin: performAction: payload.nameInGame', payload.nameInGame);
            const {participant, gameId} = await this.LeagueOfLegendsService.getLastGameDataOnlyPlayer(payload.nameInGame);
            // now we can update the action
            if (!payload.lastGameId) {
                const action = await this.LeagueOfLegendsService.getAreaWithID(payload.actionID);
                console.log('THERE WASNT A LAST GAME ID');
                const actionParams = action.actionParams;
                //now we can parse it didIWin: performAction: actionParams {"nameInGame":"TokyoVania","selectChamp":"266"}
                if (!actionParams) {
                    throw new Error('didIWin: performAction: actionParams is not defined');
                }
                const actionParamsParsed = JSON.parse(actionParams);
                actionParamsParsed.lastGameId = gameId;
                await this.LeagueOfLegendsService.addFieldToActionOrReaction(payload.actionID, true, 'actionParams', JSON.stringify(actionParamsParsed));
            } else {
                if (payload.lastGameId === gameId) {
                    console.log('didIWin: performAction: participant.championId', participant);

                    console.log('didIWin: performAction: same game id');
                    return false;
                }
            }
            //now we can update the action
            console.log('didIWin: performAction: participant.championId', participant.win);
            //didIWin: performAction: payload.selectChamp 777
            // didIWin: performAction: participant.championId 777

            if (participant.win === true) {
                console.log('didIWin: performAction: participant.championId', participant.win);
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