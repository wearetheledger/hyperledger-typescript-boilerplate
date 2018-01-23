import { ChainModule } from './../chain/chain.module';
import { QueueModule } from './../queue.module';
import { AssetsService } from './../../services/routes/assets.service';
import { Module } from '@nestjs/common';
import { AssetsController } from '../../controllers/assets.controller';

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