import { Module } from '@nestjs/common';
import { QueueListenerService } from '../services/queue/queuelistener.service';
import { QueuePusherService } from '../services/queue/queuepusher.service';

@Module({
    components: [
        QueueListenerService,
        QueuePusherService
    ],
    exports: [
        QueueListenerService,
        QueuePusherService
    ]
})
export class QueueModule { }