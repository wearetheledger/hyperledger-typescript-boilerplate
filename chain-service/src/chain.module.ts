import { Module } from '@nestjs/common';
import { RequestHelper } from './requesthelper';
import { HlfClient } from './hlfclient';
import { HlfCaClient } from './hlfcaclient';
import { HlfConfig } from './hlfconfig';

@Module({
    providers: [
        RequestHelper,
        HlfConfig,
        HlfClient,
        HlfCaClient
    ]
})
export class ChainModule {
}
