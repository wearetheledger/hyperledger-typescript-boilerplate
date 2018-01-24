import { QueueModule } from './../queue.module';
import { Module } from '@nestjs/common';
import { ChainModule } from '../chain.module';
import { AssetsService } from '../../routes/assets/assets.service';
import { AssetsController } from '../../routes/assets/assets.controller';

@Module({
    controllers: [
        AssetsController
    ],
    components: [
        AssetsService,
    ],
    modules: [
        QueueModule,
        ChainModule
    ],
})
export class AssetsModule { }