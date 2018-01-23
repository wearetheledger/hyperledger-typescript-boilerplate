import { RequestHelper } from 'hlf-node-utils';
import { AssetsService } from './../../services/routes/assets.service';
import { Module } from '@nestjs/common';
import { AssetsController } from '../../controllers/assets.controller';

@Module({
    controllers: [
        AssetsController
    ],
    components: [
        AssetsService,
        RequestHelper
    ],
    modules: [],
})
export class AssetsModule { }