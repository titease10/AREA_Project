import {Module} from '@nestjs/common';
import {ServiceManagerService} from './serviceManager.service';
import {ServiceManagerController} from './serviceManager.controller';
import {SpotifyService} from '../spotify/spotify.service';
import {GoogleAuthService} from "../auth/google/googleauth.service";
import {JwtModule} from "@nestjs/jwt";
import {ConfigModule} from "@nestjs/config";
import {AuthModule} from "../auth/auth.module";


@Module({
    imports: [JwtModule.register({
        secret: process.env.JWT_SECRET,
        signOptions: {expiresIn: '15m'},
    }), ConfigModule, AuthModule, ServiceManagerModule],
    controllers: [ServiceManagerController],
    providers: [ServiceManagerService],
    exports: [ServiceManagerService],
})
export class ServiceManagerModule {}
