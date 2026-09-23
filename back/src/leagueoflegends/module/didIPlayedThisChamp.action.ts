import { IAction } from "../../interfaces/iaction.interface";
import { ExtraParam } from "../../interfaces/areaExtraParams.interface";
import { leagueOfLegendsService } from "../leagueoflegends.service";
import { PrismaService} from "../../prisma/prisma.service";

export default class didIPlayedThisChamp implements IAction {
    constructor(private LeagueOfLegendsService: leagueOfLegendsService,
                public prismaService: PrismaService) {

    }

    name = 'did I played this champion?';
    description = 'Check if you played this champion in your last game, enter your name in the field below and select your champion';
    extraParams: ExtraParam[] = [
        {
            name: "nameInGame",
            type: "input",
            url:""
        },
        {
            name: "selectChamp",
            type: "select",
            url:`${process.env.IP_HOSTER}/leagueoflegends/champions`
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
            if (!payload.selectChamp) {
                throw new Error('didIPlayed: performAction: selectChamp is not defined');
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
                    console.log('didIPlayed: performAction: same game id');
                    return false;
                }
            }
            //now we can update the action
            console.log('didIPlayed: performAction: payload.selectChamp', payload.selectChamp);
            console.log('didIPlayed: performAction: participant.championId', participant.championId);
            //didIPlayed: performAction: payload.selectChamp 777
            // didIPlayed: performAction: participant.championId 777

            const payloadChampionId = String(payload.selectChamp).trim();
            const participantChampionId = String(participant.championId).trim();

            console.log('Comparing:', payloadChampionId, 'to', participantChampionId);

            if (payloadChampionId === participantChampionId) {
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