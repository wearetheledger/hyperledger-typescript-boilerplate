import { CarService } from './../routes/cars/car.service';
import { EventsModule } from './events.module';
import { ChainModule } from './chain.module';
import { QueueModule } from './queue.module';
import { EnvConfig } from './../config/env';
import { MiddlewaresConsumer, Module, RequestMethod } from '@nestjs/common';
import { PingService } from '../routes/ping/ping.service';
import { PingController } from '../routes/ping/ping.controller';
import { HlfClient } from '../services/chain/hlfclient';
import { QueueListenerService } from '../services/queue/queuelistener.service';
import { NestModule } from '@nestjs/common/interfaces';
import { AuthenticationMiddleware } from '../middleware/authentication.middleware';
import { CarController } from '../routes/cars/car.controller';
import * as path from 'path';
import { FabricOptions } from '../services/chain/fabricoptions.model';
import { Log } from '../services/logging/log.service';
import { HlfCaClient } from '../services/chain/hlfcaclient';
import { AuthenticationModule } from './authentication.module';
import { CredsGenerator } from '../middleware/credsgenerator.middleware';

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
        AuthenticationModule
    ],
})
export class ApplicationModule implements NestModule {

    /**
     * Creates an instance of ApplicationModule.
     * @param {HlfClient} hlfClient
     * @param caClient
     * @param {QueueListenerService} queueListenerService
     * @memberof ApplicationModule
     */
    constructor(private hlfClient: HlfClient,
        private caClient: HlfCaClient,
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
            chaincodeId: 'fabcar',
            networkUrl: `grpc://${EnvConfig.PEER_HOST}:7051`,
            eventUrl: `grpc://${EnvConfig.PEER_HOST}:7053`,
            ordererUrl: `grpc://${EnvConfig.ORDERER_HOST}:7050`
        });

        // init hlf client and hlf ca client 
        // assign admin user
        this.hlfClient.init()
            .then(result => {
                if (!EnvConfig.BYPASS_QUEUE) {
                    Log.awssqs.info(`Starting Queue Listener...`);
                    this.queueListenerService.init();
                }
                return this.caClient.init('admin', 'adminpw', 'Org1MSP');
            })
            .then(admin => {
                Log.hlf.info(`Admin user created`);
            });
    }

    /**
     * Middleware configuration
     *
     * @param {MiddlewaresConsumer} consumer
     * @memberof ApplicationModule
     */
    configure(consumer: MiddlewaresConsumer): void {
        // HlfCaMiddleware automatically generates certificates for users using the HLF Certificate Authority Client
        consumer.apply(CredsGenerator).forRoutes(
            { path: '*', method: RequestMethod.ALL }
        );
        // authenticated routes
        consumer.apply(AuthenticationMiddleware).forRoutes(
            { path: '/protectedroute', method: RequestMethod.ALL },
            // {path: '/cars', method: RequestMethod.ALL}
        );
    }
}