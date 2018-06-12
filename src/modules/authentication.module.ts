import { Global, Module } from '@nestjs/common';
import { AuthService } from '../common/config/appconfig';

@Global()
@Module({
    providers: [AuthService],
    exports: [AuthService]
})
export class AuthenticationModule {
}