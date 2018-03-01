import { Module } from '@nestjs/common';
import { ChainService } from '../services/chain/chain.service';
import { RequestHelper } from '../services/chain/requesthelper';
import { HlfClient } from '../services/chain/hlfclient';
import { HlfCaClient } from '../services/chain/hlfcaclient';
import { HlfConfig } from '../services/chain/hlfconfig';

@Module({
    components: [
        ChainService,
        RequestHelper,
        HlfConfig,
        HlfClient,
        HlfCaClient
    ],
    exports: [
        ChainService,
        RequestHelper,
        HlfConfig,
        HlfClient,
        HlfCaClient
    ]
})
export class ChainModule { }