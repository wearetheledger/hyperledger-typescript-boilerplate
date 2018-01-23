import { RequestHelper, HlfClient } from 'hlf-node-utils';
import { Module } from '@nestjs/common';

@Module({
    controllers: [
    ],
    components: [
        HlfClient,
        RequestHelper,
    ],
    modules: [
    ],
    exports: [
        HlfClient,
        RequestHelper,
    ]
})
export class HlfModule { }