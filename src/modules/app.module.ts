import { CarService } from '../routes/cars/car.service';
import { EventsModule } from './events.module';
import { ChainModule } from './chain.module';
import { QueueModule } from './queue.module';
import { EnvConfig } from '../common/config/env';
import { PingService } from '../routes/ping/ping.service';
import { PingController } from '../routes/ping/ping.controller';
import { HlfClient } from '../services/chain/hlfclient';
import { QueueListenerService } from '../services/queue/queuelistener.service';
import { NestModule } from '@nestjs/common/interfaces';
import { CarController } from '../routes/cars/car.controller';
import { Log } from '../services/logging/log.service';
import { HlfCaClient } from '../services/chain/hlfcaclient';
import { AuthenticationModule } from './authentication.module';
import { HlfcredsgeneratorMiddleware } from '../common/middleware/hlfcredsgenerator.middleware';
import { HlfErrors } from '../services/chain/logging.enum';
import { Appconfig } from '../common/config/appconfig';
import { JwtauthenticationMiddleware } from '../common/middleware/jwtauthentication.middleware';
import { MiddlewareConsumer, Module } from '@nestjs/common';

@Module({
    controllers: [
        PingController,
        CarController,
    ],
    providers: [
        PingService,
        CarService,
    ],
    imports: [
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

        // list env keys in console
        for (let propName of Object.keys(EnvConfig)) {
            Log.config.debug(`${propName}:  ${EnvConfig[propName]}`);
        }

        // init hlf client and hlf ca client
        // assign admin user
        this.hlfClient.init(Appconfig.hlf)
            .then(result => {
                if (!EnvConfig.BYPASS_QUEUE) {
                    Log.awssqs.info(`Starting Queue Listener...`);
                    this.queueListenerService.init();
                }
                return this.caClient.init(Appconfig.hlf.admin);
            })
            .catch(err => {
                Log.awssqs.error(HlfErrors.ERROR_STARTING_HLF, err.message);
            });
    }

    /**
     * Middleware configuration
     *
     * @param {MiddlewaresConsumer} consumer
     * @memberof ApplicationModule
     */
    configure(consumer: MiddlewareConsumer): void {

        consumer
            .apply([JwtauthenticationMiddleware, HlfcredsgeneratorMiddleware])
            .forRoutes('/cars*');
    }
}