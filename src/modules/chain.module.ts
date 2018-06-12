import { Global, Module } from '@nestjs/common';
import { RequestHelper } from '../services/chain/requesthelper';
import { HlfClient } from '../services/chain/hlfclient';
import { HlfCaClient } from '../services/chain/hlfcaclient';
import { HlfConfig } from '../services/chain/hlfconfig';
import { EventsModule } from './events.module';
import { QueueModule } from './queue.module';

@Global()
@Module({
    providers: [
        RequestHelper,
        HlfConfig,
        HlfClient,
        HlfCaClient
    ],
    exports: [
        RequestHelper,
        HlfConfig,
        HlfClient,
        HlfCaClient
    ]
})
export class ChainModule {
}
