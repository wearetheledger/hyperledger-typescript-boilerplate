import { Module } from '@nestjs/common';
import { RequestHelper } from './requesthelper';
import { HlfClient } from './hlfclient';
import { HlfCaClient } from './hlfcaclient';
import { HlfConfig } from './hlfconfig';
import { EventsModule } from '../events/events.module';

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
    ],
    imports: [
        EventsModule
    ]
})
export class ChainModule {
}
