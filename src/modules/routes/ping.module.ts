import { Module } from '@nestjs/common';
import { QueueModule } from '../queue.module';
import { ChainModule } from '../chain.module';
import { PingController } from '../../routes/ping/ping.controller';
import { PingService } from '../../routes/ping/ping.service';

@Module({
    controllers: [
        PingController
    ],
    components: [
        PingService,
    ],
    modules: [
        ChainModule,
        QueueModule
    ],
})
export class PingModule { }