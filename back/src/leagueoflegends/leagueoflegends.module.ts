import { Module } from '@nestjs/common';
import { leagueOfLegendsService } from './leagueoflegends.service';
import { LeagueoflegendsController } from './leagueoflegends.controller';
import { AuthModule } from '../auth/auth.module';
import {ServiceManagerModule} from "../serviceManager/serviceManager.module";
import {JwtModule} from "@nestjs/jwt";
import {ConfigModule} from "@nestjs/config";

@Module({
    imports: [JwtModule.register({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '15m' },
    }), ConfigModule, AuthModule, ServiceManagerModule],
    controllers: [LeagueoflegendsController],
    providers: [leagueOfLegendsService],
})
export class LeagueoflegendsModule {}