import { EventsModule } from './events.module';
import { RequestHelper, HlfClient } from 'hlf-node-utils';
import { Module } from '@nestjs/common';
import { QueueListenerService } from '../services/queue/queuelistener.service';
import { QueuePusherService } from '../services/queue/queuepusher.service';

@Module({
    controllers: [
    ],
    components: [
        HlfClient,
        RequestHelper,
        QueueListenerService,
        QueuePusherService
    ],
    modules: [
        EventsModule
    ],
    exports: [
        QueueListenerService,
        QueuePusherService
    ]
})
export class QueueModule { }