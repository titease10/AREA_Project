import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { GithubService } from './github.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { ServiceManagerModule } from '../serviceManager/serviceManager.module';
import { GithubController } from './github.controller';

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
  controllers: [GithubController],
  providers: [GithubService],
})
export class GithubModule {}
