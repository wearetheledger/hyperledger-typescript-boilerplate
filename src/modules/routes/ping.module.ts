import { PingController } from './../../controllers/ping.controller';
import { PingService } from './../../services/routes/ping.service';
import { Module } from '@nestjs/common';
import { QueueModule } from '../queue.module';
import { ChainModule } from '../chain/chain.module';

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