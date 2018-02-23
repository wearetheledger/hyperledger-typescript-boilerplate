import { CarService } from './../routes/cars/car.service';
import { EventsModule } from './events.module';
import { ChainModule } from './chain.module';
import { QueueModule } from './queue.module';
import { EnvConfig } from './../config/env';
import { FabricOptions, Log } from 'hlf-node-utils';
import { MiddlewaresConsumer, Module, RequestMethod } from '@nestjs/common';
import { PingService } from '../routes/ping/ping.service';
import { PingController } from '../routes/ping/ping.controller';
import { HlfClient } from '../services/chain/hlfclient';
import { QueueListenerService } from '../services/queue/queuelistener.service';
import { NestModule } from '@nestjs/common/interfaces';
import { AuthenticationMiddleware } from '../middleware/authentication.middleware';
import { CarController } from '../routes/cars/car.controller';
import * as path from 'path';

@Module({
    controllers: [
        PingController,
        CarController,
    ],
    components: [
        PingService,
        CarService,
    ],
    modules: [
        ChainModule,
        QueueModule,
        EventsModule,
    ],
})
export class ApplicationModule implements NestModule {

    /**
     * Creates an instance of ApplicationModule.
     * @param {HlfClient} hlfClient
     * @param {QueueListenerService} queueListenerService
     * @memberof ApplicationModule
     */
    constructor(private hlfClient: HlfClient,
                private queueListenerService: QueueListenerService) {

        // list env keys in cli
        for (let propName of Object.keys(EnvConfig)) {
            Log.config.debug(`${propName}:  ${EnvConfig[propName]}`);
        }

        // set hlf client options
        this.hlfClient.setOptions(<FabricOptions>{
            walletPath: path.resolve(__dirname, '..', 'config', `creds`),
            userId: 'admin',
            channelId: 'mychannel',
            networkUrl: `grpc://${EnvConfig.PEER_HOST}:7051`,
            eventUrl: `grpc://${EnvConfig.PEER_HOST}:7053`,
            ordererUrl: `grpc://${EnvConfig.ORDERER_HOST}:7050`
        });

        // init hlf client
        this.hlfClient.init().then(result => {
            if (!EnvConfig.BYPASS_QUEUE) {
                Log.awssqs.info(`Starting Queue Listener...`);
                this.queueListenerService.init();
            }
        });
    }

    /**
     * Protected routes
     *
     * @param {MiddlewaresConsumer} consumer
     * @memberof ApplicationModule
     */
    configure(consumer: MiddlewaresConsumer): void {
        consumer.apply(AuthenticationMiddleware).forRoutes(
            { path: '/protectedroute', method: RequestMethod.ALL },
            // {path: '/cars', method: RequestMethod.ALL}
        );
    }
}