import { BaseAuthService} from "./baseauth.service";
import {
    Controller,
    Get,
    Query,
    Res,
    Headers,
    Post,
    Req, Param, UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';

@Controller('baseauth')
export class BaseAuthController {
    constructor(private BaseAuthService: BaseAuthService) {}

}