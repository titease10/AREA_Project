import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RefreshTokenParamsDto } from '../../interfaces/refreshToken.interface';
import { IService } from '../../interfaces/iservice.interface';
import { IAction } from '../../interfaces/iaction.interface';
import { IQuery } from '../../interfaces/iQuerry.interface';
import { IReaction } from '../../interfaces/ireaction.interface';
import { promises as fs } from 'fs';
import { join } from 'path';
import { ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Authentication Service')
@Injectable()
export abstract class BaseAuthService implements IService {
  @ApiProperty({ description: 'Logger for the service' })
  protected readonly logger: Logger;
  @ApiProperty({ description: 'Authentification url for the service' })
  protected authUrl: string;
  @ApiProperty({ description: 'Api url for the service' })
  protected apiUrl: string;
  @ApiProperty({ description: 'Client id for the service' })
  protected clientId: string;
  @ApiProperty({ description: 'Client secret for the service' })
  protected clientSecret: string;
  @ApiProperty({ description: 'Indicates if the service is public' })
  protected isPublicService: boolean;
  @ApiProperty({ description: 'Use for the first check of update to use cash and clean it(PUBLIC SERVICE ONLY' })
  protected firstCheckOfUpdate: boolean = true;

  constructor(
    protected baseClientId: string,
    protected baeClientSecret: string,
    protected authBaseUrl: string,
    public apiBaseUrl: string,
    public prisma: PrismaService,
  ) {
    this.logger = new Logger(this.constructor.name);
    this.authUrl = authBaseUrl;
    this.apiUrl = apiBaseUrl;
    this.clientId = baseClientId;
    this.clientSecret = baeClientSecret;
    this.initializeAccessToken();
    this.isPublicService = false; // Set to true for public services
  }

  IAction: IAction[] = []; // Initialize the array
  IReaction: IReaction[] = []; // Initialize the array
  IQuery: IQuery[] = []; // Initialize the array
  protected abstract initializeAccessToken(): Promise<void>;

  protected abstract getDataWithoutTokenId(): Promise<any>;

  protected abstract setSupportedActionsAndEvents(): Promise<any>;

  /**
   * This method should be implemented by subclasses to refresh the access token for a user.
   * It should handle the logic for refreshing tokens based on the service provider's API.
   *
   * @param params RefreshTokenParamsDto containing account ID, JWT token, and refresh token.
   * @returns A promise that resolves with the new access token.
   */
  abstract refreshToken(params: RefreshTokenParamsDto): Promise<string>;


  setIsPublicService(isPublic: boolean): void {
    this.isPublicService = isPublic;
  }

  getIsPublicService(): boolean {
    return this.isPublicService;
  }

  setFirstCheckOfUpdate(firstCheckOfUpdate: boolean): void {
    this.firstCheckOfUpdate = firstCheckOfUpdate;
  }

  getFirstCheckOfUpdate(): boolean {
    return this.firstCheckOfUpdate;
  }
  async getQuery(queryName: string): Promise<IQuery | null> {
    const query = this.IQuery.find((q) => q.name === queryName);
    if (!query) {
      console.error('Query not found:', queryName);
      return null;
    }
    console.log('we are in getQuery of the service :', this.constructor.name);
    return query;
  }
  async getSupportedActionsAndEventsFrontend(): Promise<any> {
    const actionsFront = [];
    for (const action of this.IAction) {
      actionsFront.push({
        name: action.name,
        description: action.description,
        extraParams: action.extraParams || [],
      });
    }

    const reactionsFront = [];
    for (const reaction of this.IReaction) {
      reactionsFront.push({
        name: reaction.name,
        description: reaction.description,
        extraParams: reaction.extraParams || [],
      });
    }
    const queriesFront = [];
    for (const query of this.IQuery) {
      queriesFront.push({
        name: query.name,
        description: query.description,
        extraParams: query.extraParams || [],
      });
    }
    return {
      actions: actionsFront,
      reactions: reactionsFront,
      queries: queriesFront,
    };
  }



  protected async getClientCredentialsToken(): Promise<string> {
    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      console.log(
        'currently in getClientCredentialsToken for service :',
        this.constructor.name,
      );
      console.log('params', params);
      console.log('authUrl', this.authUrl);
      const response = await axios.post(this.authUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        auth: {
          username: this.clientId,
          password: this.clientSecret,
        },
      });
      console.log('response', response.headers);

      return response.data.access_token;
    } catch (error) {
      console.error(
        'Error fetching client credentials token:',
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  async exchangeAuthorizationCodeForToken(
    code: string,
    tokenUrl: string,
    redirectUri: string,
  ): Promise<{
    access_token: string;
    expires_in: number;
    scope: string;
    token_type: string;
    id_token: string;
    refresh_token: string;
    userData: any;
  }> {
    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'authorization_code');
      params.append('code', code);
      params.append('redirect_uri', redirectUri);

      const authString = `${this.clientId}:${this.clientSecret}`;
      const authHeader = `Basic ${Buffer.from(authString).toString('base64')}`;

      const response = await axios.post(tokenUrl, params, {
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      this.logger.log('Access token and ID token successfully obtained.');
      return response.data;
    } catch (error) {
      this.logger.error(
        'Failed to exchange authorization code for token',
        error,
      );
      throw error;
    }
  }

  protected generateAuthUrl(
    scopes: string[],
    redirectUri: string,
    responseType: string = 'code',
    extraParams: Record<string, string> = {},
  ): string {
    const queryParams = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirectUri,
      response_type: responseType,
      scope: scopes.join(' '),
      ...extraParams,
    });
    console.log('queryParams', queryParams);
    console.log('authUrl', this.authUrl);
    return `${this.authUrl}?${queryParams.toString()}`;
  }

  async getAccountDB(
    userId: string,
    PrismaService: PrismaService,
    provider: string,
  ) {
    return PrismaService.account.findFirst({
      where: {
        userId: userId,
        provider: provider,
      },
    });
  }
 async getUserDB(
    userId: string,
    PrismaService: PrismaService,
  ) {
    return PrismaService.user.findFirst({
      where: {
        id: userId,
      },
    });
  }

  async getAreaWithID(
    actionOrReactionID: string,
  ): Promise<any> {
    //we will use the db and return the AREA with the id

    const area = await this.prisma.actionReaction.findFirst({
        where: {
            id: actionOrReactionID,
        },
        });
    if (!area) {
          console.error('Area not found:', actionOrReactionID);
          return null;
          }
    return area;
  }
  async addFieldToActionOrReaction(
    actionOrReactionID: string,
    isAction: boolean,
    field: string,
    value: string,
  ): Promise<any> {
    //we will use the db and return the AREA with the id
    const area = await this.prisma.actionReaction.update({
        where: {
            id: actionOrReactionID,
        },
        data: {
            [field]: value,
        },
        });
    if (!area) {
          console.error('Area not found:', actionOrReactionID);
          return null;
          }
    return area;
  }

  //executeAction
  async executeAction(
    userId: string,
    actionName: string,
    actionParams: any,
    provider: string,
    actionID: string,
  ): Promise<Boolean> {
    const action = this.IAction.find((a) => a.name === actionName);
    if (!action) {
      console.error('Action not found:', actionName);
      return false;
    }

    const account = await this.getAccountDB(userId, this.prisma, provider);
    if (!account && this.isPublicService === false) {
      console.error(
        `Account not found for user ${userId} and provider ${provider}`,
      );
      return false;
    }
    //if its a public service we will send the user and not the account
    if (this.isPublicService === true) {
      const user = await this.getUserDB(userId, this.prisma);
        if (!user) {
            console.error(
            `User not found for user ${userId} and provider ${provider}`,
            );
            return false;
        }
        const executionResult = await action.performAction({
        ...JSON.parse(actionParams),
        userId: userId,
        user: user,
        actionID: actionID,
        });
        console.log('Action execution result:', executionResult);
        return executionResult;
    }

    const executionResult = await action.performAction({
      ...JSON.parse(actionParams),
      userId: userId,
      account: account, // Assuming there's only one account per user and provider
    });

    console.log('Action execution result:', executionResult);
    return executionResult;
  }

  async executeReaction(
    userId: string,
    reactionName: string,
    reactionParams: any,
    provider: string,
    reactionID: string,
  ): Promise<any> {
    const reaction = this.IReaction.find((r) => r.name === reactionName);
    if (!reaction) {
      console.error('Reaction not found:', reactionName);
      return;
    }

    const account = await this.getAccountDB(userId, this.prisma, provider);
    if (!account && this.isPublicService === false) {
      const user = await this.getUserDB(userId, this.prisma);
      if (!user) {
        console.error(
            `User not found for user ${userId} and provider ${provider}`,
        );
        return false;
      }
      const executionResult = await reaction.performReaction({
        ...JSON.parse(reactionParams),
        userId: userId,
        user: user,
        reactionID: reactionID,
      });
      console.log('Reaction execution result:', executionResult);
      return executionResult;
    }

    await reaction.performReaction({
      ...JSON.parse(reactionParams),
      userId: userId,
      account: account, // Assuming there's only one account per user and provider
    });

    console.log('Reaction executed successfully');
  }

  async executeQuery(
    userId: string,
    queryName: string,
    queryParams: any,
    provider: string,
  ): Promise<any> {
    const query = this.IQuery.find((q) => q.name === queryName);
    if (!query) {
      console.error('Query not found:', queryName);
      return;
    }

    const account = await this.getAccountDB(userId, this.prisma, provider);
    if (!account) {
      console.error(
        `Account not found for user ${userId} and provider ${provider}`,
      );
      return;
    }

    const result = await query.performQuery({
      ...JSON.parse(queryParams),
      userId: userId,
      account: account, // Assuming there's only one account per user and provider
    });

    console.log('Query executed successfully');
    return result;
  }

  async setActions(provider: string) {
    const actionsDir = join(__dirname, provider, 'module'); // Adjust the path based on provider
    const files = await fs.readdir(actionsDir);
    console.log('files', files, 'provider', provider, 'actionsDir', actionsDir);
    for (const file of files) {
      if (file.endsWith('.action.js')) {
        const modulePath = join(actionsDir, file);
        const module = await import(modulePath);
        const actionClass = require(modulePath).default;
        console.log('actionClass', actionClass);
        try {
          const action = new actionClass(this);
          this.IAction.push(action);
        } catch (error) {
          console.error(`Error creating action ${actionClass.name}:`, error);
        }
      }
    }
    console.log(
      'Actions after loop:',
      this.IAction.map((a) => a.name),
    );
  }

  async setReactions(provider: string) {
    const reactionsDir = join(__dirname, provider, 'module'); // Adjust the path based on provider
    const files = await fs.readdir(reactionsDir);
    for (const file of files) {
      if (file.endsWith('.reaction.js')) {
        const modulePath = join(reactionsDir, file);
        const module = await import(modulePath);
        const reactionClass = require(modulePath).default;
        console.log('reactionClass', reactionClass);
        try {
          const reaction = new reactionClass(this);
          this.IReaction.push(reaction);
        } catch (error) {
          console.error(
            `Error creating reaction ${reactionClass.name}:`,
            error,
          );
        }
      }
    }
    console.log(
      'Reactions after loop:',
      this.IReaction.map((r) => r.name),
    );
  }

  async setQueries(provider: string) {
    const queriesDir = join(__dirname, provider, 'module'); // Adjust the path based on provider
    const files = await fs.readdir(queriesDir);
    for (const file of files) {
      if (file.endsWith('.query.js')) {
        const modulePath = join(queriesDir, file);
        const module = await import(modulePath);
        const queryClass = require(modulePath).default;
        try {
          const query = new queryClass(this);
          this.IQuery.push(query);
        } catch (error) {
          console.error(`Error creating query ${queryClass.name}:`, error);
        }
      }
    }
    console.log(
      'Queries after loop:',
      this.IQuery.map((q) => q.name),
    );
  }

  async checkAndUpdateDatabase(
    accountId: string,
    newData: any,
    dataType: string,
    comparisonKey: string,
    comparator: (existingItem: any, newItem: any) => boolean,
    provider: string,
  ): Promise<boolean> {
    try {
      console.log('checkAndUpdateDatabase: accountId', accountId);
      const accountExists = await this.prisma.account.findFirst({
        where: { userId: accountId, provider: provider },
      });

      if (!accountExists) {
        console.log(
          `Account with ID ${accountId} does not exist in the Account table.`,
        );
        // Handle the non-existent account scenario, e.g., return false or throw an error
        return false;
      }

      const serviceModel = this.getServiceModel(provider) as unknown as {
        findFirst: Function;
        create: Function;
        update: Function;
      };
      console.log('serviceModel :', provider);
      const existingEntry = await serviceModel.findFirst({
        where: { accountId: accountExists.id },
      });

      console.log('existingEntry :', existingEntry);
      if (!existingEntry) {
        console.log(
          `Creating new entry in ${provider}Service for accountId:`,
          accountId,
        );
        await serviceModel.create({
          data: {
            accountId: accountExists.id,
            userId: accountId,
            [dataType]: { set: [newData] },
          },
        });
        return true;
      }

      let updateRequired = false;
      const existingData = existingEntry[dataType] as any[];
      //check if the data exist in the database
      if (!existingData) {
        updateRequired = true;
        console.log('Update is required due to empty database.');
        newData = [newData];

      }
      if (updateRequired) {
        await serviceModel.update({
          where: { id: existingEntry.id },
          data: { [dataType]: { set: newData } },
        });
        return updateRequired;
      }
      if (existingData.length === 1) {
        if (!existingData || comparator(existingData[0], newData)) {
          updateRequired = true;
          console.log('Update is required due to changes.');
          newData = [newData];
        } else {

          console.log('No update required, data is the same.');
        }
      } else {
        if (!existingData || existingData.length === 0) {
          updateRequired = true;
          newData = [newData];
        } else {
          if (!Array.isArray(newData)) {
            newData = [newData];
          }
          for (const item of newData) {
            const existingItemIndex = existingData.findIndex(
              (item) => item.id === comparisonKey,
            );

            if (
              existingItemIndex === -1 ||
              comparator(existingData[existingItemIndex], item)
            ) {
              updateRequired = true;
              break; // Break the loop if an update is required
            }
          }
        }
      }

      if (updateRequired) {
        await serviceModel.update({
          where: { id: existingEntry.id },
          data: { [dataType]: { set: newData } },
        });
      }

      return updateRequired;
    } catch (error) {
      console.error('Error checking and updating database:', error);
      throw error;
    }
  }

  private getServiceModel(provider: string) {
    switch (provider) {
      case 'spotify':
        return this.prisma.spotifyService;
      case 'google':
        return this.prisma.googleService;
      case 'github':
        return this.prisma.githubService;
        case 'discord':
        return this.prisma.discordService;
      case 'facebook':
        return this.prisma.facebookService;
      case 'microsoft':
        return this.prisma.microsoftService;
      // Add cases for other services as needed
      default:
        throw new Error(`Unknown service provider: ${provider}`);
    }
  }
}
