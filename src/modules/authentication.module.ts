import { Module } from '@nestjs/common';
import { Auth0Service } from '../services/authentication/auth0/auth0.service';

@Module({
  components: [Auth0Service],
  exports: [Auth0Service]
})
export class AuthenticationModule { }