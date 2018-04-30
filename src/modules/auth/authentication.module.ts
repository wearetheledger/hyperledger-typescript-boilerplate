import { Module } from '@nestjs/common';
import { CivicController } from './civic/civic.controller';
import { CivicAuthenticationService } from './civic/civic-authentication.service';
import { ChainModule } from '../chain.module';
import { Auth0AuthenticationService } from './auth0/auth0-authentication.service';

@Module({
    controllers: [
        CivicController,
    ],
    components: [CivicAuthenticationService, Auth0AuthenticationService],
    exports: [],
    modules: [ChainModule],
})
export class AuthenticationModule {
}