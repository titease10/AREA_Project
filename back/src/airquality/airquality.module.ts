import { Module } from '@nestjs/common';
import { airQualityService} from "./airquality.service";
import { AirqualityController } from './airquality.controller';
import { AuthModule } from '../auth/auth.module';
import {ServiceManagerModule} from "../serviceManager/serviceManager.module";
import {JwtModule} from "@nestjs/jwt";
import {ConfigModule} from "@nestjs/config";

@Module({
    imports: [JwtModule.register({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '15m' },
    }), ConfigModule, AuthModule, ServiceManagerModule],
    controllers: [AirqualityController],
    providers: [airQualityService],
})
export class AirqualityModule {}