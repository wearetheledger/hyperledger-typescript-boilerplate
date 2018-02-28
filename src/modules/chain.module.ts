import { Module } from '@nestjs/common';
import { ChainService } from '../services/chain/chain.service';
import { RequestHelper } from '../services/chain/requesthelper';
import { HlfClient } from '../services/chain/hlfclient';
import { HlfCaClient } from '../services/chain/hlfcaclient';

@Module({
    components: [
        ChainService,
        RequestHelper,
        HlfClient,
        HlfCaClient
    ],
    exports: [
        ChainService,
        RequestHelper,
        HlfClient,
        HlfCaClient
    ]
})
export class ChainModule { }