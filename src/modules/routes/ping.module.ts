import { QueueListenerService } from './../../services/awasqs/queuelistener.service';
import { HlfClient, RequestHelper } from 'hlf-node-utils';
import { PingController } from './../../controllers/ping.controller';
import { PingService } from './../../services/routes/ping.service';
import { Module } from '@nestjs/common';

@Module({
    controllers: [
        PingController
    ],
    components: [
        PingService,
        HlfClient,
        RequestHelper,
        QueueListenerService,
    ],
    modules: [
        
    ],
})
export class PingModule { }