import { Inject, Module } from '@nestjs/common';
import { AuthenticationModule } from './authentication/authentication.module';
import { ChainModule } from './chain/chain.module';
import { EventsModule } from './events/events.module';
import { HlfClient } from './chain/hlfclient';
import { HlfCaClient } from './chain/hlfcaclient';
import { HlfErrors } from './chain/logging.enum';
import { Appconfig } from '../common/config/appconfig';
import { Log } from '../common/utils/logging/log.service';
import { EnvConfig } from '../common/config/env';
import { Json } from '../common/utils/json';
import { IEventService } from './events/interfaces/event.interface';

@Module({
    imports: [
        AuthenticationModule,
        ChainModule,
        EventsModule
    ]
})
export class CoreModule {

    /**
     * Creates an instance of ApplicationModule.
     * @param {HlfClient} hlfClient
     * @param caClient
     * @param webSocketService
     * @memberof ApplicationModule
     */
    constructor(
        private hlfClient: HlfClient,
        private caClient: HlfCaClient,
        @Inject('IEventService') private webSocketService: IEventService
    ) {

        // init hlf client and hlf ca client
        // assign admin user
        this.hlfClient.init()
            .then(() => {
                return this.caClient.init(Appconfig.hlf.admin);
            })
            .catch(err => {
                Log.awssqs.error(HlfErrors.ERROR_STARTING_HLF, err.message);
            });
    }

}