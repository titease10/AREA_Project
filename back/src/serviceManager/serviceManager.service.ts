import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventEmitter } from 'events';
import { BaseAuthService } from '../Base/baseauth/baseauth.service';
import { IService } from '../interfaces/iservice.interface';
import { PrismaService } from '../prisma/prisma.service';
import {IAction} from "../interfaces/iaction.interface";
import {IReaction} from "../interfaces/ireaction.interface";
import {IQuery} from "../interfaces/iQuerry.interface";
@Injectable()
export class ServiceManagerService extends EventEmitter implements OnModuleInit {
    private services: Map<string, BaseAuthService>;

    constructor(
        public prisma: PrismaService,
    ) {
        super();
        this.services = new Map();
        setInterval(() => {
            this.executeActionReactions();
        }, 10000); // Adjust the interval as needed
    }

    registerService(name: string, service: BaseAuthService) {
        this.services.set(name, service);
    }

    getService(name: string): BaseAuthService {
        return this.services.get(name);
    }
    getActionReactionAllServicesFrontend(): any {
        const actionReactionAllServicesFrontend = [];
        this.services.forEach(async (service, providerName) => {
            const result = await service.getSupportedActionsAndEventsFrontend();
            const isPublic = service.getIsPublicService();
            actionReactionAllServicesFrontend.push({ provider: providerName, isPublic, ...result });
        });
        return actionReactionAllServicesFrontend;
    }
    async getActionReactionsOfUser(userId: string): Promise<any> {
        try {
            const actionReactions = await this.prisma.actionReaction.findMany({
                where: {
                    userId,
                },
            });
            return actionReactions;
        } catch (error) {
            console.log('Error getting action-reactions:', error);
            throw error;
        }
    }

    async toggleActionReaction(userId: string, actionReactionId: string): Promise<any> {
        //will set the active to true or false
        try {
            const actionReaction = await this.prisma.actionReaction.findUnique({
                where: {
                    id: actionReactionId,
                },
            });
            const updatedActionReaction = await this.prisma.actionReaction.update({
                where: {
                    id: actionReactionId,
                },
                data: {
                    active: !actionReaction.active,
                },
            });
            return updatedActionReaction;
        } catch (error) {
            console.log('Error updating action-reaction:', error);
            throw error;
        }
    }
    async deleteActionReaction(userId: string, actionReactionId: string): Promise<any> {
        try {
            const deletedActionReaction = await this.prisma.actionReaction.delete({
                where: {
                    id: actionReactionId,
                },
            });
            return deletedActionReaction;
        } catch (error) {
            console.log('Error deleting action-reaction:', error);
            throw error;
        }
    }
    async saveActionReaction(userId: string, actionName: string, reactionName: string, actionParams: any, reactionParams: any, actionProvider: string, reactionProvider: string): Promise<any> {
        try {
            // Validate parameters here (optional)

            if (!this.services.has(actionProvider) || !this.services.has(reactionProvider)) {
                throw new Error('Invalid action or reaction provider');
            }

            const actionParamsJson = JSON.stringify(actionParams);
            const reactionParamsJson = JSON.stringify(reactionParams);

            const savedEntry = await this.prisma.actionReaction.create({
                data: {
                    userId,
                    actionEventId: actionName,
                    reactionEventId: reactionName,
                    actionParams: actionParamsJson,
                    reactionParams: reactionParamsJson,
                    actionProvider,
                    reactionProvider,
                },
            });

            console.log(`ActionReaction pair saved successfully: ${savedEntry.id}`);
            return savedEntry;
        } catch (error) {
            console.log('Error saving action-reaction pair', error);
            throw error;
        }
    }
    onModuleInit() {
        // Initialize anything if needed
    }

    emitEvent(event: string, payload: any) {
        this.emit(event, payload);
    }

    subscribeToEvent(event: string, listener: (...args: any[]) => void) {
        this.on(event, listener);
    }
    listServices(): string[] {
        return Array.from(this.services.keys());
    }
    getActionReactionAllServices():Promise<{IActionList:IAction[],IReactionList:IReaction[]}> {
        let IActionList: IAction[] = []; // Initialize the array
        let IReactionList: IReaction[] = []; // Initialize the array
        this.services.forEach(async (service, providerName) => {
            if (service.getIsPublicService()) {
                //we need to set the first check of update to true
                IActionList = [...IActionList, ...service.IAction];
                IReactionList = [...IReactionList, ...service.IReaction];
            }

        });
        //        this.services.forEach(async (service, providerName) => {
        return new Promise<{IActionList:IAction[],IReactionList:IReaction[]}>((resolve, reject) => {
            resolve({IActionList,IReactionList});
        }
        );
    }



    setPublicServiceFirstCheckOfUpdateTrue(): void {
        this.services.forEach(async (service, providerName) => {
            if (service.getIsPublicService()) {
                //we need to set the first check of update to true
                await service.setFirstCheckOfUpdate(true);
            }
        }
        );
    }


    async executeActionReactions(): Promise<void> {
        try {
            const users = await this.prisma.user.findMany({
                include: {
                    actionReactions: true,
                },
            });
            //we will set all the public services setFirstCheckOfUpdate to true
            //getActionReactionAllServices
            this.setPublicServiceFirstCheckOfUpdateTrue();
            for (const user of users) {
                for (const actionReaction of user.actionReactions) {
                    if (actionReaction.active) {
                        await this.executeSingleActionReaction(user.id, actionReaction);
                    }
                }
            }
        } catch (error) {
            console.error('Error executing action-reactions:', error);
        }
    }

    private async executeSingleActionReaction(userId: string, actionReaction): Promise<void> {
        try {
            const actionService = this.getService(actionReaction.actionProvider);
            const reactionService = this.getService(actionReaction.reactionProvider);
            if (!actionService || !reactionService) {
                throw new Error('Service not found');
            }
            console.log(`Executing action-reaction pair for user ${userId}`);
            console.log('actionReaction', actionReaction);
            //check if the service is a public service
            const actionResult = await actionService.executeAction(userId, actionReaction.actionEventId, actionReaction.actionParams, actionReaction.actionProvider, actionReaction.id);
            if (actionResult) {
                await reactionService.executeReaction(userId, actionReaction.reactionEventId, actionReaction.reactionParams, actionReaction.reactionProvider, actionReaction.id);
            }
        } catch (error) {
            console.error(`Error executing action-reaction pair for user ${userId}:`, error);
        }
    }
}
