import { Auth0CredsService } from './../services/authentication/auth0/auth0.credsservice';
import { Module } from '@nestjs/common';

@Module({
  components: [Auth0CredsService],
  exports: [Auth0CredsService]
})
export class AuthenticationModule { }