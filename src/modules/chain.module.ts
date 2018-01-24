import { Module } from '@nestjs/common';
import { ChainService } from '../services/chain/chain.service';
import { RequestHelper } from '../services/chain/requesthelper';
import { HlfClient } from '../services/chain/hlfclient';

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
    ]
})
export class ChainModule { }