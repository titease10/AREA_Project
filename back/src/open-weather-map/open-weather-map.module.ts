import { Module } from '@nestjs/common';
import { OpenWeatherMapService } from './open-weather-map.service';
import { OpenWeatherMapController } from './open-weather-map.controller';
import { AuthModule } from '../auth/auth.module';
import {ServiceManagerModule} from "../serviceManager/serviceManager.module";
import {JwtModule} from "@nestjs/jwt";
import {ConfigModule} from "@nestjs/config";

@Module({
    imports: [JwtModule.register({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '15m' },
    }), ConfigModule, AuthModule, ServiceManagerModule],
    controllers: [OpenWeatherMapController],
    providers: [OpenWeatherMapService],
})
export class OpenWeatherMapModule {}