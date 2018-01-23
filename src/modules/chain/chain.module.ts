import { ChainService } from './services/chain.service';
import { Module } from '@nestjs/common';
import { RequestHelper } from './services/requesthelper';
import { HlfClient } from './services/hlfclient';

@Module({
    components: [
        ChainService,
        RequestHelper,
        HlfClient
    ],
    exports: [
        ChainService,
        RequestHelper,
        HlfClient
    ],
    modules: [
    ]
})
export class ChainModule { }