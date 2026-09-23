import axios from 'axios';
import { IReaction } from "../../interfaces/ireaction.interface";
import { IAction } from "../../interfaces/iaction.interface";
import {GithubService} from "../github.service";
import {ExtraParam} from "../../interfaces/areaExtraParams.interface";

export default class NewRepoByUserAction implements IAction {
    constructor(private GithubService: GithubService) {}
    extraParams: ExtraParam[] = [
        {
            name: "username",
            type: "input",
            url: "" // URL is not needed for a direct input field.
        }
    ];

    name = 'New repository by a specific username or organization\n';
    description = 'Check if there are new repositories for a specific username or organization, enter the username or organization name in the field below';
    async performAction(payload: any): Promise<Boolean> {

        try {
            console.log('NewRepoByUserAction: performAction: payload', payload);
            if (!payload.username) {
                throw new Error('NewRepoByUserAction: performAction: username is not defined');
            }
            console.log('NewRepoByUserAction: performAction: username', payload.username);
            //            //we are going to use the reposListOfUser field in the db to store all the repos of that the user hold in the payload (which is the username) owns
            if (!payload.account?.userId) {
                throw new Error('NewRepoByUserAction: performAction: account.userId is undefined');
            }
            console.log('NewRepoByUserAction: performAction: account.userId', payload.account.userId);
            //go get the user in db and check if the token is still valid
            const githubAccount = await this.GithubService.prisma.account.findFirst({
                where: {
                    userId: payload.account.userId, provider: 'github',
                },
            });
            if (!githubAccount || !githubAccount.access_token) {
                throw new Error('github account not found or access token missing.');
            }
            const response = await axios.get(
                `https://api.github.com/users/${payload.username}/repos`,
                {
                    headers: {
                        Authorization: `token ${githubAccount.access_token}`,
                        'Content-Type': 'application/json',
                    },
                },
            );
            console.log('NewRepoByUserAction: performAction: response', response.data);
            // Check and update the database for the moment the comparator will just check the number of items in the data returned by the api
            const comparator = (existingItem, newItem) => {
                return existingItem.length !== newItem.length;
            };

            // Check and update the database

            return await this.GithubService.checkAndUpdateDatabase(
                payload.account.userId,
                response.data,
                'reposListOfUser',
                'id',
                comparator,
                "github"
            );

            return false;
        } catch (error) {
            console.error('Error when trying to check if a playlist exists', error);
            throw error;
        }
    }
}