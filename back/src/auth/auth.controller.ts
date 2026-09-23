import {
    Controller,
    Get,

    Headers,
    Post,
    Body, UnauthorizedException, Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, SignDto, SetPasswordDto } from './dto';
import {Response} from "express";

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signUp')
  signup(@Body() dto: AuthDto) {
    return this.authService.signUp(dto);
  }
  @Post('signIn')
  signin(@Body() dto: SignDto) {
    return this.authService.signIn(dto);
  }
  @Get('profile')
  async profile(
      @Headers('authorization') authHeader: string,
    ) {
    if (!authHeader) {
      return null;
    }
    const jwtToken = authHeader.split(' ')[1];
    const decodedToken = this.authService.jwt.decode(jwtToken);
    const userId = decodedToken ? decodedToken.sub : null;
    if (!userId) {
      return null;
    }
    const user = await this.authService.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    delete user.hash;
    return user;
  }
    @Post('set-password')
    async setPassword(
        @Body('password') newPassword: string,
        @Body('token') token: string,
        @Res() res: Response,
    ) {
        if (!token) throw new UnauthorizedException('No token provided');
        console.log('token', token);
        const decodedToken = this.authService.jwt.decode(token);
        if (!decodedToken || !decodedToken.sub) throw new UnauthorizedException('Invalid token');

        // Call a service method to update the password
         await this.authService.updatePassword(decodedToken.sub, newPassword);
        return res.status(200).redirect(`${process.env.FRONTEND_URL}/login`);
    }

    @Get('accounts-list')
    async accountsList(
        @Headers('authorization') authHeader: string,
        ) {
        if (!authHeader) {
        return null;
        }
        const jwtToken = authHeader.split(' ')[1];
        const decodedToken = this.authService.jwt.decode(jwtToken);
        const userId = decodedToken ? decodedToken.sub : null;
        if (!userId) {
        return null;
        }
        const accounts = await this.authService.prisma.account.findMany({
        where: {
            userId,
        },
        });
        return accounts;
    }
}

