import { Module } from '@nestjs/common';
import { SpotifyService } from './spotify.service';
import { SpotifyController } from './spotify.controller';
import {AuthModule} from "../auth/auth.module";
import {JwtModule} from "@nestjs/jwt";
import {ConfigModule} from "@nestjs/config";
import {ServiceManagerModule} from "../serviceManager/serviceManager.module";

@Module({
  imports: [JwtModule.register({
    secret: process.env.JWT_SECRET,
    signOptions: { expiresIn: '15m' },
  }), ConfigModule, AuthModule, ServiceManagerModule],
  controllers: [SpotifyController],
  providers: [SpotifyService],
})
export class SpotifyModule {}
