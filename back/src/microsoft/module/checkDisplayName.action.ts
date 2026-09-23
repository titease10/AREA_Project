import { IAction } from "../../interfaces/iaction.interface";
import { ExtraParam } from "../../interfaces/areaExtraParams.interface";
import { MicrosoftService} from "../microsoft.service";

export default class didYouChangeDisplayName implements IAction {
    constructor(private MicrosoftService: MicrosoftService) {
    }

    name = 'didYouChangeDisplayName?';
    description = 'Check if you changed your display name';
   // displayName

    async performAction(payload: any): Promise<Boolean> {
        try {
            console.log('didYouChangeDisplayName: performAction: payload', payload);
            const microsoftAccountId = payload.account?.userId;
            console.log('didYouChangeDisplayName: performAction: microsoftAccountId', microsoftAccountId);
            if (!microsoftAccountId) {
                throw new Error('didYouChangeDisplayName: performAction: microsoftAccount.id is undefined');
            }

            const microsoftAccount = await this.MicrosoftService.prisma.account.findFirst({
                where: {
                    userId: microsoftAccountId, provider: 'microsoft',
                },
            });
            if (!microsoftAccount || !microsoftAccount.access_token) {
                throw new Error('discord account not found or access token missing.');
            }

            const lastMessage = await this.MicrosoftService.fetchUserData(microsoftAccount.access_token);
            console.log('Last message:', lastMessage);
            //split name to get first name
            //newJson is supposed to be used to send a true json object to the database

            //check if first name is the same as the one in the database
            const comparator = (existingItem, newItem) => {
                //we need to cut the name to get the first nam
                console.log("existingItem", existingItem);
                console.log("newItem", newItem);
                console.log("existingItem.displayName", existingItem.displayName);
                console.log("newItem.displayName", newItem.displayName);
                return existingItem.displayName !== newItem.displayName;
            }

            // Check and update the database
            return await this.MicrosoftService.checkAndUpdateDatabase(
                microsoftAccountId,
                lastMessage,
                'userDisplayName',
                lastMessage.id,
                comparator,
                "microsoft"
            );

            return false;

        } catch (error) {
            console.error('Error when trying to check for new messages in channel', error);
            throw error;
        }
    }
}