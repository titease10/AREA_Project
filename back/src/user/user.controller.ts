import { Controller, Get, Req, UnauthorizedException } from '@nestjs/common';
import { verifyJwtToken } from '../auth/middleware/jwt.middleware';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Controller('users')
export class UserController {
  constructor(private jwtService: JwtService) {}

  @Get('me')
  async getProtectedResource(@Req() req: Request) {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      throw new UnauthorizedException('Authorization header is missing.');

    const token = authHeader.split(' ')[1];
    const userData = verifyJwtToken(this.jwtService, token);
    return userData;
  }
}
