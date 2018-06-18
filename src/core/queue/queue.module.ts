import { Module } from '@nestjs/common';
import { QueueListenerService } from './queuelistener.service';
import { QueuePusherService } from './queuepusher.service';

@Module({
    providers: [
        QueueListenerService,
        QueuePusherService
    ],
    exports: [
        QueueListenerService,
        QueuePusherService
    ]
})
export class QueueModule {
}