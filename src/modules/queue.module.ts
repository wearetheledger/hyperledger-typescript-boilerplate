import { Global, Module } from '@nestjs/common';
import { QueueListenerService } from '../services/queue/queuelistener.service';
import { QueuePusherService } from '../services/queue/queuepusher.service';

@Global()
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