import { EventsModule } from './events.module';
import { ChainModule } from './chain.module';
import { QueueModule } from './queue.module';
import { EnvConfig } from './../config/env';
import { Log, FabricOptions } from 'hlf-node-utils';
import { Module } from '@nestjs/common';
import { PingService } from '../routes/ping/ping.service';
import { PingController } from '../routes/ping/ping.controller';
import { AssetsController } from '../routes/assets/assets.controller';
import { AssetsService } from '../routes/assets/assets.service';
import { HlfClient } from '../services/chain/hlfclient';
import { QueueListenerService } from '../services/queue/queuelistener.service';

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

    /**
     * Creates an instance of PingService.
     * Will init the hlf client
     * @param {HlfClient} hlfClient 
     * @memberof PingService
     */
    constructor(
        private hlfClient: HlfClient,
        private queueListenerService: QueueListenerService) {

        this.hlfClient.setOptions(<FabricOptions>{
            walletPath: `./src/config/creds`,
            userId: 'PeerAdmin',
            channelId: 'mychannel',
            networkUrl: `grpc://${EnvConfig.PEER_HOST}:7051`,
            eventUrl: `grpc://${EnvConfig.PEER_HOST}:7053`,
            ordererUrl: `grpc://${EnvConfig.ORDERER_HOST}:7050`
        });

        this.hlfClient.init().then(result => {
            Log.awssqs.info(`Starting Queue Listener...`);
            this.queueListenerService.init();
        });

         // list env keys in cli
         for (let propName of Object.keys(EnvConfig)) {
            Log.config.debug(`${propName}:  ${EnvConfig[propName]}`);
        }
    }
}