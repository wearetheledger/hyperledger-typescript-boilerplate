import { Module } from '@nestjs/common';
import { Auth0AuthenticationService } from './auth0/auth0-authentication.service';

@Module({
    providers: [Auth0AuthenticationService],
    exports: [],
    imports: []
})
export class AuthenticationModule {
}
