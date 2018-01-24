import { PingController } from './../../controllers/ping.controller';
import { Module } from '@nestjs/common';
import { QueueModule } from '../queue.module';
import { ChainModule } from '../chain.module';
import { PingService } from '../../services/routes/ping/ping.service';

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