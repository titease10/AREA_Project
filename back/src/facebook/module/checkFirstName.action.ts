import { IAction } from "../../interfaces/iaction.interface";
import { ExtraParam } from "../../interfaces/areaExtraParams.interface";
import { FacebookService} from "../facebook.service";

export default class didYouChangeFirstName implements IAction {
    constructor(private FacebookService: FacebookService) {
    }

    name = 'didYouChangeFirstName?';
    description = 'This will check if you changed your first name';


    async performAction(payload: any): Promise<Boolean> {
        try {
            console.log('didYouChangeName: performAction: payload', payload);
            const facebookAccountId = payload.account?.userId;
            console.log('didYouChangeName: performAction: facebookAccountId', facebookAccountId);
            if (!facebookAccountId) {
                throw new Error('didYouChangeName: performAction: facebookAccount.id is undefined');
            }

            const facebookAccount = await this.FacebookService.prisma.account.findFirst({
                where: {
                    userId: facebookAccountId, provider: 'facebook',
                },
            });
            if (!facebookAccount || !facebookAccount.access_token) {
                throw new Error('discord account not found or access token missing.');
            }

            const lastMessage = await this.FacebookService.fetchUserData(facebookAccount.access_token);
            console.log('Last message:', lastMessage);
            //split name to get first name
            //newJson is supposed to be used to send a true json object to the database

            //check if first name is the same as the one in the database
            const comparator = (existingItem, newItem) => {
                //we need to cut the name to get the first name
                const existingItemFirstName = existingItem.name.split(" ")[0];
                const newItemFirstName = newItem.name.split(" ")[0];

                return existingItemFirstName !== newItemFirstName;
            }

            // Check and update the database
            return await this.FacebookService.checkAndUpdateDatabase(
                facebookAccountId,
                lastMessage,
                'userFirstName',
                lastMessage.id,
                comparator,
                "facebook"
            );

            return false;

        } catch (error) {
            console.error('Error when trying to check for new messages in channel', error);
            throw error;
        }
    }
}