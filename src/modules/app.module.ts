import { AssetModule } from './routes/asset.module';
import { PingModule } from './routes/ping.module';
import { Module } from '@nestjs/common';

@Module({
    controllers: [],
    components: [],
    modules: [
        AssetModule,
        PingModule
    ],
})
export class ApplicationModule { }