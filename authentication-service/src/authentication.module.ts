import { Module } from '@nestjs/common';
import { Auth0AuthenticationService } from './auth0/auth0-authentication.service';
import { CoreModule } from './core/core.module';

@Module({
  imports: [CoreModule],
  providers: [Auth0AuthenticationService],
  exports: [],
})
export class AuthenticationModule {}
