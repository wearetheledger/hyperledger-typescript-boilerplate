import { RequestHelper, HlfClient } from 'hlf-node-utils';
import { QueuePusherService } from './../services/awasqs/queuepusher.service';
import { QueueListenerService } from './../services/awasqs/queuelistener.service';
import { Module } from '@nestjs/common';

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
    ],
    exports: [
        QueueListenerService,
        QueuePusherService
    ]
})
export class QueueModule { }