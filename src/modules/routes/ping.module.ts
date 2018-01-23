import { HlfModule } from './../hlf.module';
import { PingController } from './../../controllers/ping.controller';
import { PingService } from './../../services/routes/ping.service';
import { Module } from '@nestjs/common';
import { QueueModule } from '../queue.module';

@Module({
    controllers: [
        PingController
    ],
    components: [
        PingService,
    ],
    modules: [
        HlfModule,
        QueueModule
    ],
})
export class PingModule { }