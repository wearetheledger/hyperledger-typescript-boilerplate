import { Module } from '@nestjs/common';
import { AuthService } from '../config/appconfig';

@Module({
    components: [AuthService],
    exports: [AuthService]
})
export class AuthenticationModule {
}