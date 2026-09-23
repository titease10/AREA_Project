
// Interface for a service that can provide actions and reactions
import {IAction} from "./iaction.interface";
import {IReaction} from "./ireaction.interface";
import {ApiProperty} from "@nestjs/swagger";
export class RefreshTokenParamsDto {
    @ApiProperty({ example: '123456', description: 'Account ID' })
    accountId?: string;

    @ApiProperty({ example: 'jwt_token_example', description: 'JWT token for the user' })
    jwtToken?: string;

    @ApiProperty({ example: 'token_example', description: 'Refresh token' })
    token?: string;
}
