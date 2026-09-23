import { ServiceManagerService } from './serviceManager.service';
import {
    Controller,
    Get,
    Query,
    Res,
    Headers,
    Post,
    Req, Body, UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from '../auth/auth.service';
import { RequestWithSession } from '../requestWithSession.interface';
import {JwtService} from "@nestjs/jwt";
import {ApiHeaders, ApiParam, ApiProperty, ApiQuery, ApiResponse, ApiTags} from '@nestjs/swagger';
@ApiTags('ServiceManager')
@Controller('serviceManager')
export class ServiceManagerController {
    constructor(
        private authService: AuthService,
        private serviceManagerService: ServiceManagerService,
        private jwtService: JwtService,

    ) {}
    @ApiResponse({ status: 200, description: 'Get the list of services our app supports' })
    @Get('listServices')
    async listServices() {
        return this.serviceManagerService.listServices();
    }
    @ApiResponse({ status: 200, description: 'Get the list of AREA our app supports' })
    @Get('listActionReactions')
    async listActionReactions() {
        return this.serviceManagerService.getActionReactionAllServicesFrontend();
    }
    @ApiResponse({ status: 200, description: 'correctly saved the action and reaction' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @Post('save-action-reaction')
    async saveActionReaction(
        @Headers('authorization') authHeader: string,
        @Body('action') action: string,
        @Body('reaction') reaction: string,
        @Body('actionProvider') actionProvider: string,
        @Body('reactionProvider') reactionProvider: string,
        @Body('actionParams') actionParams: any,
        @Body('reactionParams') reactionParams: any,
    ) {
        if (!authHeader) {
            throw new UnauthorizedException('Authorization header is missing.');
        }
        const jwtToken = authHeader.split(' ')[1];
        const decodedToken = this.jwtService.decode(jwtToken);
        const userId = decodedToken ? decodedToken.sub : null;
        if (!userId) {
            throw new UnauthorizedException('Token is invalid or expired.');
        }

        // Call saveActionReaction from ServiceManagerService with the new parameters
        await this.serviceManagerService.saveActionReaction(
            userId,
            action,
            reaction,
            actionParams,
            reactionParams,
            actionProvider,
            reactionProvider
        );

        return { message: 'Action and reaction saved.' };
    }
    @ApiResponse({ status: 200, description: 'the list of action reactions of the user' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @Get('getActionReactionsOfUser')
    async getActionReactionsOfUser(
        @Headers('authorization') authHeader: string,
    ) {
        if (!authHeader) {
            throw new UnauthorizedException('Authorization header is missing.');
        }
        const jwtToken = authHeader.split(' ')[1];
        const decodedToken = this.jwtService.decode(jwtToken);
        const userId = decodedToken ? decodedToken.sub : null;
        if (!userId) {
            throw new UnauthorizedException('Token is invalid or expired.');
        }
        return this.serviceManagerService.getActionReactionsOfUser(userId);
    }
    @ApiResponse({ status: 200, description: 'successfully deleted the action reaction' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @Post('deleteActionReaction')
    async deleteActionReaction(
        @Headers('authorization') authHeader: string,
        @Body('actionReactionId') actionReactionId: string,
    ) {
        if (!authHeader) {
            throw new UnauthorizedException('Authorization header is missing.');
        }
        const jwtToken = authHeader.split(' ')[1];
        const decodedToken = this.jwtService.decode(jwtToken);
        const userId = decodedToken ? decodedToken.sub : null;
        if (!userId) {
            throw new UnauthorizedException('Token is invalid or expired.');
        }
        return this.serviceManagerService.deleteActionReaction(userId, actionReactionId);
    }
    @ApiResponse({ status: 200, description: 'successfully toggled the action reaction' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @Post('toggleActionReaction')
    async toggleActionReaction(
        @Headers('authorization') authHeader: string,
        @Body('actionReactionId') actionReactionId: string,
    ) {
        if (!authHeader) {
            throw new UnauthorizedException('Authorization header is missing.');
        }
        const jwtToken = authHeader.split(' ')[1];
        const decodedToken = this.jwtService.decode(jwtToken);
        const userId = decodedToken ? decodedToken.sub : null;
        if (!userId) {
            throw new UnauthorizedException('Token is invalid or expired.');
        }
        return this.serviceManagerService.toggleActionReaction(userId, actionReactionId);
    }
}