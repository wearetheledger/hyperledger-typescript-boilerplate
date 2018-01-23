import { AssetsModule } from './routes/assets.module';
import { PingModule } from './routes/ping.module';
import { Module } from '@nestjs/common';

@Module({
    controllers: [],
    components: [],
    modules: [
        AssetsModule,
        PingModule
    ],
})
export class ApplicationModule { }