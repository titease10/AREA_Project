import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SpotifyModule } from './spotify/spotify.module';
import { BaseAuthModule } from './Base/baseauth/baseauth.module';
import { GoogleAuthModule } from './auth/google/googleauth.module';
import { TwitterModule } from './twitter/twitter.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { PrismaModule } from './prisma/prisma.module';
import { ServiceManagerModule } from './serviceManager/serviceManager.module';
import { DiscordModule } from './discord/discord.module';
import { OpenWeatherMapModule } from './open-weather-map/open-weather-map.module';
import { GithubModule } from './github/github.module';
import { FacebookModule } from './facebook/facebook.module';
import {MicrosoftModule} from "./microsoft/microsoft.module";
import { TimeioModule } from './timeio/timeio.module';
import { LeagueoflegendsModule } from "./leagueoflegends/leagueoflegends.module";
import { MailgunModule} from "./mailgun/mailgun.module";
import { AirqualityModule } from './airquality/airquality.module';

@Module({
  imports: [
    SpotifyModule,
    BaseAuthModule,
    GoogleAuthModule,
    TwitterModule,
    AuthModule,
    UserModule,
    BookmarkModule,
    PrismaModule,
    ServiceManagerModule,
    DiscordModule,
    OpenWeatherMapModule,
    GithubModule,
    FacebookModule,
    MicrosoftModule,
    TimeioModule,
    LeagueoflegendsModule,
    MailgunModule,
    AirqualityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
