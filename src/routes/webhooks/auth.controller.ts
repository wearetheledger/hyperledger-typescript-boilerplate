import { Auth0Service } from '../../services/webhooks/auth0.service';
import { Auth0UserModel } from './models/auth0user.model';
import { ApiUseTags } from '@nestjs/swagger';
import { Body, Controller, Headers, Post, UnauthorizedException } from '@nestjs/common';

@ApiUseTags('auth')
@Controller('auth')
export class AuthController {

    private auth0Url = `http://localhost:3000`; // TODO add env

    constructor(private auth0Service: Auth0Service) {
    }

    @Post('/register/auth0')
    create(@Body() auth0UserModel: Auth0UserModel, @Headers('origin') remoteUrl): string {
        console.log(remoteUrl);

        if (remoteUrl === this.auth0Url) {
            this.auth0Service.enrollUser(auth0UserModel);
            return 'OK';
        } else {
            throw new UnauthorizedException();
        }
    }

}