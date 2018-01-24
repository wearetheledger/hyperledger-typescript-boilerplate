import { QueueModule } from './../queue.module';
import { Module } from '@nestjs/common';
import { AssetsController } from '../../controllers/assets.controller';
import { ChainModule } from '../chain.module';
import { AssetsService } from '../../services/routes/assets/assets.service';

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