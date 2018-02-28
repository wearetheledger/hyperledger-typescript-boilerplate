import { Auth0Service } from '../../services/webhooks/auth0.service';
import { ApiUseTags } from '@nestjs/swagger';
import { Body, Controller, Headers, Post, UnauthorizedException } from '@nestjs/common';

@ApiUseTags('auth')
@Controller('auth')
export class AuthController {

    private auth0Url = ``;

    constructor(private auth0Service: Auth0Service) {
    }

    @Post('/register/auth0')
    create(@Body() userObject, @Headers('origin') remoteUrl): string {
        let data;

        if (remoteUrl === this.auth0Url) {
            data = this.auth0Service.getUserData(userObject);
            return 'OK';
        } else {
            throw new UnauthorizedException();
        }

        //this.chainService.createNewUser(data)
    }

}