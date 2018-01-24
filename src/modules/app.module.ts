import { EventsModule } from './events.module';
import { ChainModule } from './chain.module';
import { QueueModule } from './queue.module';
import { EnvConfig } from './../config/env';
import { Log } from 'hlf-node-utils';
import { Module } from '@nestjs/common';
import { PingService } from '../routes/ping/ping.service';
import { PingController } from '../routes/ping/ping.controller';
import { AssetsController } from '../routes/assets/assets.controller';
import { AssetsService } from '../routes/assets/assets.service';

@Module({
    controllers: [
        PingController,
        AssetsController
    ],
    components: [
        PingService,
        AssetsService
    ],
    modules: [
        ChainModule,
        QueueModule,
        EventsModule
    ],
})
export class ApplicationModule {
    constructor() {
        // list env keys in cli
        for (let propName of Object.keys(EnvConfig)) {
            Log.config.debug(`${propName}:  ${EnvConfig[propName]}`);
        }
    }
}