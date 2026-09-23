import { Injectable } from '@nestjs/common';
import { BaseAuthService } from '../Base/baseauth/baseauth.service';
import axios from "axios";
import {RefreshTokenParamsDto} from "../interfaces/refreshToken.interface";
import {ServiceManagerService} from "../serviceManager/serviceManager.service";
import {PrismaService} from "../prisma/prisma.service";
import {JwtService} from "@nestjs/jwt";
import * as FormData from 'form-data';
import {IQuery} from "../interfaces/iQuerry.interface";

interface FetchMailDataParams {
    endpoint: string;
    jwtToken?: string;
    accountId?: string;
    userID?: string;
    additionalParams?: Record<string, any>;
}

interface SendMailDataParams {
    endpoint: string;
    jwtToken?: string;
    accountId?: string;
    userID?: string;
    from?: string;
    to?: string;
    subject?: string;
    text?: string;
}
//MAILGUN_SENDING_API_KEY
@Injectable()
export class MailgunService extends BaseAuthService {
    constructor(
        private serviceManager: ServiceManagerService,
        private jwt: JwtService,
        public prisma: PrismaService,
    ) {
        super(
            process.env.MAILGUN_API_KEY,
            process.env.MAILGUN_API_KEY,
            '',
            'https://api.eu.mailgun.net/v3/myarea.social/',
            prisma,
        );
        console.log('OpenWeatherMapService constructor');
        this.setSupportedActionsAndEvents();
        this.setIsPublicService(true);
        serviceManager.registerService('mailgun', this);

    }
    protected async initializeAccessToken(): Promise<void> {
    }

    generateAuthUrl(): string {
        return '';
    }
    async refreshToken({accountId, jwtToken, token}: RefreshTokenParamsDto): Promise<any> {
        return;
    }

    async getDataWithoutTokenId() {
    }

    async createAccountFromJwtToken(jwtToken: string): Promise<any> {
        console.log('createAccountFromJwtToken' + jwtToken);
        let email = '';
        let providerAccountId = '';
        let firstName = '';
        let lastName = '';

        const decoded = this.jwt.decode(jwtToken);
        console.log(decoded);
        if (decoded) {
            email = decoded.email;
            providerAccountId = decoded.sub;
            firstName = decoded.given_name;
            lastName = decoded.family_name;
        }

        let user = await this.prisma.user.findUnique({where: {id: providerAccountId}});
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    id: providerAccountId,
                    email,
                    firstName,
                    lastName,
                },
            });
        }
        console.log('user', user);
        let linkedAccount = await this.prisma.account.findFirst({
            where: {userId: user.id, provider: 'mailgun'},
        });
        if (!linkedAccount) {
            linkedAccount = await this.prisma.account.create({
                data: {
                    userId: user.id,
                    type: 'oauth',
                    provider: 'mailgun',
                    providerAccountId,
                    access_token: jwtToken,
                },
            });
        }

        return linkedAccount;
    }
    async setSupportedActionsAndEvents() {
        await this.setActions('../../mailgun');
        console.log('actions set :D');
        await this.setReactions('../../mailgun');
    }
    async getServiceQuery(queryName: string, queryProvider: string): Promise<IQuery | null> {
        try {
            const service = this.serviceManager.getService(queryProvider);
            if (!service) {
                throw new Error('Service not found');
            }
            console.log(`Getting query ${queryName} from provider ${queryProvider}`);
            return await service.getQuery(queryName);
        } catch (error) {
            console.error('Error getting query:', error);
            throw error;
        }
    }
    async fetchMailData(params: FetchMailDataParams): Promise<any> {
        const {endpoint, jwtToken, accountId, userID, additionalParams} = params;
        const url = this.apiBaseUrl + endpoint;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`,
        };
        const paramsToSend = {
            ...additionalParams,
            token: jwtToken,
            accountId,
            userID,
        };
        const response = await axios.get(url, {headers, params: paramsToSend});
        return response.data;
    }


    async postMailData(params: SendMailDataParams): Promise<any> {
        const { from, to, subject, text } = params;
        const url = this.apiBaseUrl + params.endpoint;

        // Basic Authentication for Mailgun
        //const auth = 'Basic ' + Buffer.from(`api:${process.env.MAILGUN_SENDING_API_KEY}`).toString('base64'); add user=api
        const auth = 'Basic ' + Buffer.from(`api:${process.env.MAILGUN_SENDING_API_KEY}`).toString('base64');

        // Using form-data to construct the request body
        console.log('auth', auth);
        const formData = new FormData();
        formData.append('from', from);
        formData.append('to', to);
        formData.append('subject', subject);
        formData.append('text', text);
        const headers = {
            ...formData.getHeaders(),
            Authorization: auth,
        };
        console.log('Headers:', headers);

        // Axios request with form-data
        try {
            const response = await axios.post(url, formData, { headers });
            return response.data;
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }

    }
}
