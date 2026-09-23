import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader)
        throw new UnauthorizedException('Authorization header is missing.');

      const token = authHeader.split(' ')[1];
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      req['user'] = decoded;
      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid token.');
    }
  }
}

export function verifyJwtToken(jwtService: JwtService, token: string) {
  try {
    return jwtService.verify(token);
  } catch (error) {
    throw new UnauthorizedException('Invalid token.');
  }
}
