import { AssetService } from './../../services/routes/asset.service';
import { Module } from '@nestjs/common';
import { AssetController } from '../../controllers/asset.controller';

@Module({
    controllers: [
        AssetController
    ],
    components: [
        AssetService
    ],
    modules: [],
})
export class AssetModule { }