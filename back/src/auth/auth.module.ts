import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UserSession } from './session/session.class';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [JwtModule.register({
    secret: process.env.JWT_SECRET,
    signOptions: { expiresIn: '15m' },
  }), ConfigModule]
  ,
  controllers: [AuthController],
  providers: [AuthService, UserSession],
  exports: [AuthService],
})
export class AuthModule {}
