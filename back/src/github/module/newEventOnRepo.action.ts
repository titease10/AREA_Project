import axios from 'axios';
import { IAction } from "../../interfaces/iaction.interface";
import { GithubService } from "../github.service";
import { ExtraParam } from "../../interfaces/areaExtraParams.interface";

export default class NewRepositoryEventAction implements IAction {
    constructor(private GithubService: GithubService) {}
    extraParams: ExtraParam[] = [
        {
            name: "repository",
            type: "input",
            url: "" // URL is not needed for a direct input field.
        }
    ];

    name = 'New Repository Event for a specific repository';
    description = 'Check if there are new events for a specific repository, enter the repository name in the field below';

    async performAction(payload: any): Promise<Boolean> {
        try {
            if (!payload.repository) {
                throw new Error('NewRepositoryEventAction: performAction: repository name is not defined');
            }
            if (!payload.account?.userId) {
                throw new Error('NewRepositoryEventAction: performAction: account.userId is undefined');
            }

            const githubAccount = await this.GithubService.prisma.account.findFirst({
                where: {
                    userId: payload.account.userId, provider: 'github',
                },
            });

            if (!githubAccount || !githubAccount.access_token) {
                throw new Error('GitHub account not found or access token missing.');
            }

            const response = await axios.get(
                `https://api.github.com/repos/${payload.repository}/events`,
                {
                    headers: {
                        Authorization: `token ${githubAccount.access_token}`,
                        'Content-Type': 'application/json',
                    },
                },
            );

            // Comparator function to determine if there are new events
            const comparator = (existingItem, newItem) => {
                return existingItem.length !== newItem.length;
            };

            return await this.GithubService.checkAndUpdateDatabase(
                payload.account.userId,
                response.data,
                'latestRepoEvents',
                'id', // ID or some unique identifier of the event
                comparator,
                "github"
            );

        } catch (error) {
            console.error('Error in NewRepositoryEventAction', error);
            throw error;
        }
    }
}
