import { QueueModule } from './queue.module';
import { EnvConfig } from './../config/env';
import { Log } from 'hlf-node-utils';
import { AssetsModule } from './routes/assets.module';
import { PingModule } from './routes/ping.module';
import { Module } from '@nestjs/common';

@Module({
    controllers: [],
    components: [],
    modules: [
        AssetsModule,
        PingModule,
        QueueModule
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