import { Global, Module } from '@nestjs/common';
import { PingController } from './ping.controller';
import { PingService } from './ping.service';

@Module({
    controllers: [
        PingController,
    ],
    providers: [
        PingService,
    ]
})
export class PingModule {
}
