import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MicrosoftService } from './microsoft.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { ServiceManagerModule } from '../serviceManager/serviceManager.module';
import { MicrosoftController } from './microsoft.controller';

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
  controllers: [MicrosoftController],
  providers: [MicrosoftService],
})
export class MicrosoftModule {}
