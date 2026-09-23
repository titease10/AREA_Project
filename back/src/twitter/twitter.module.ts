import { Module } from '@nestjs/common';
import { TwitterService } from './twitter.service';
import { TwitterController } from './twitter.controller';
import {AuthModule} from "../auth/auth.module";
import {ServiceManagerModule} from "../serviceManager/serviceManager.module";
import {JwtModule} from "@nestjs/jwt";

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '15m' },
        }),
        AuthModule,
        ServiceManagerModule],
    controllers: [TwitterController],
    providers: [TwitterService],
})
export class TwitterModule {}
