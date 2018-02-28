import { Auth0Service } from './../../services/webhooks/auth0.service';
import { ApiUseTags } from '@nestjs/swagger';
import { Controller, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';

@ApiUseTags('auth0')
@Controller('auth0')
export class Auth0Controller {

    private auth0Ip = ``;

    constructor(private auth0Service: Auth0Service) { }

    @Post('/newusercreated')
    create(@Body() userObject, @Headers('origin') remoteIp): string {
        if (remoteIp === this.auth0Ip) {
            this.auth0Service.createNewUser(userObject);
            return 'OK';
        } else {
            throw new UnauthorizedException();
        }
    }

}