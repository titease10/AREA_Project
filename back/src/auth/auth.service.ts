import {Injectable, ForbiddenException} from '@nestjs/common';
import {PrismaService} from 'src/prisma/prisma.service';
import {AuthDto, SignDto} from './dto';
import * as argon from 'argon2';
import {PrismaClientKnownRequestError} from '@prisma/client/runtime/library';
import {JwtService} from '@nestjs/jwt';
import {ConfigService} from '@nestjs/config';
import {UserSession} from './session/session.class';

@Injectable()
export class AuthService {
    private blacklistedTokens: Set<string> = new Set();

    constructor(
        public prisma: PrismaService,
        public jwt: JwtService,
        private config: ConfigService,
        private userSession: UserSession,
    ) {
        this.userSession = new UserSession();
    }

    async signUp(dto: AuthDto) {
        const hash = await argon.hash(dto.password);
        try {
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    hash,
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                },
            });
            delete user.hash;

            return user;
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ForbiddenException('Email is already in use');
                }
            }
            throw error;
        }
    }

    async signIn(dto: SignDto) {
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
            },
        });
        if (!user) throw new ForbiddenException('User has not been found');
        const passwordMatches = await argon.verify(user.hash, dto.password);
        if (!passwordMatches) throw new ForbiddenException('Invalid password');
        //transform the number to a string
        return this.signToken(user.id, user.email);
    }

    async signToken(
        userId: string,
        email: string,
    ): Promise<{ access_token: string }> {
        const data = {
            sub: userId,
            email,
        };
        const secret = this.config.get<string>('JWT_SECRET');

        const token = await this.jwt.signAsync(data, {
            expiresIn: '15m',
            secret: secret,
        });
        return {
            access_token: token,
        };
    }

    async updatePassword(userId: string, newPassword: string) {
        const hash = await argon.hash(newPassword);
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: { hash },
        });
        return updatedUser;
    }


    async signOut(token: string) {
        this.blacklistedTokens.add(token);
        this.userSession.endSession();
    }

    isTokenBlacklisted(token: string): boolean {
        return this.blacklistedTokens.has(token);
    }


    async linkExternalAccount(provider: string, externalUser: any, uncodedJWT: any ): Promise<{ user: any; accessToken: string}> {
        console.log ("trying to link external account with provider ", provider)
        // Decode the ID Token
        let email = '';
        let providerAccountId = '';
        let firstName = '';
        let lastName = '';

        if (externalUser.id_token && externalUser.token_type === 'Bearer') {
            const decodedIdToken = this.jwt.decode(externalUser.id_token);
            email = decodedIdToken.email;
            providerAccountId = decodedIdToken.sub; // 'sub' field in JWT is the user ID
            firstName = decodedIdToken.given_name || '';
            lastName = decodedIdToken.family_name || '';
        } else {
            // Use provided details directly for services without JWT
            console.log('externalUser', externalUser)
            email = externalUser.email || 'jeancyprienroux@gmail.com'
            providerAccountId = String(externalUser.id || externalUser.data.id);
            firstName = externalUser.firstName || '';
            lastName = externalUser.lastName || '';
        }

        //we will now decode the jwt token to get the user id
        console.log("uncodedJWT", uncodedJWT)
        const decoded = this.jwt.decode(uncodedJWT);
        const userId = decoded.sub;
        let user = await this.prisma.user.findUnique({where: {id: userId}});
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    email,
                    firstName,
                    lastName,
                },
            });
        }

        let linkedAccount = await this.prisma.account.findFirst({
            where: {userId: user.id, provider, providerAccountId},
        });

        if (!linkedAccount) {
            console.log("token and data saved in the database the token will expire in ", externalUser.expires_in)
            console.log("the token will expire at ", Math.floor((Date.now() / 1000) + externalUser.expires_in))

            console.log("date now ", Date.now())

            linkedAccount = await this.prisma.account.create({
                data: {
                    userId: user.id,
                    type: 'oauth',
                    provider,
                    providerAccountId,
                    access_token: externalUser.access_token,
                    refresh_token: externalUser.refresh_token,
                    token_type: externalUser.token_type,
                    expires_at: externalUser.expires_in ? Math.floor(Date.now() / 1000) + externalUser.expires_in : null,
                    expires: externalUser.expires_in ? new Date(Math.floor((Date.now() + externalUser.expires_in ))) : null,
                    scope: externalUser.scope,
                    id_token: externalUser.id_token,
                },
            });

        } else {
            throw new ForbiddenException('Account already linked');
        }

        const userAccessToken = await this.signToken(user.id, user.email);
        return {user, accessToken: userAccessToken.access_token};
    }
}
