import { Module } from '@nestjs/common';
import { GoogleAuthService } from './googleauth.service';
import { GoogleAuthController } from './googleauth.controller';
import { AuthModule } from '../auth.module'; // Assuming AuthModule is where AuthService is provided
import {ServiceManagerModule} from "../../serviceManager/serviceManager.module";
import {JwtModule} from "@nestjs/jwt";
import {ConfigModule} from "@nestjs/config";

@Module({
    imports: [JwtModule.register({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '15m' },
    }), ConfigModule, AuthModule, ServiceManagerModule],
    controllers: [GoogleAuthController],
    providers: [GoogleAuthService],
})
export class GoogleAuthModule {}
