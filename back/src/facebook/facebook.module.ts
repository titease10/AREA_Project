import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { FacebookService } from './facebook.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { ServiceManagerModule } from '../serviceManager/serviceManager.module';
import { FacebookController } from './facebook.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
    ConfigModule,
    AuthModule,
    ServiceManagerModule,
  ],
  controllers: [FacebookController],
  providers: [FacebookService],
})
export class FacebookModule {}
