import { Module } from '@nestjs/common';
import { AuthService } from '../../common/config/appconfig';
import { ChainModule } from '../chain/chain.module';

@Module({
    providers: [AuthService],
    exports: [AuthService],
    imports: [ChainModule]
})
export class AuthenticationModule {
}