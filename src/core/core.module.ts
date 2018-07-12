import { Inject, Module } from '@nestjs/common';
import { AuthenticationModule } from './authentication/authentication.module';
import { ChainModule } from './chain/chain.module';
import { QueueModule } from './queue/queue.module';
import { EventsModule } from './events/events.module';
import { HlfClient } from './chain/hlfclient';
import { HlfCaClient } from './chain/hlfcaclient';
import { QueueListenerService } from './queue/queuelistener.service';
import { HlfErrors } from './chain/logging.enum';
import { Appconfig } from '../common/config/appconfig';
import { Log } from '../common/utils/logging/log.service';
import { EnvConfig } from '../common/config/env';
import { Json } from '../common/utils/json';
import { MessageBody } from './queue/interfaces/messagebody.model';
import { IEventService } from './events/interfaces/event.interface';

@Module({
    imports: [
        AuthenticationModule,
        ChainModule,
        QueueModule,
        EventsModule
    ]
})
export class CoreModule {

    /**
     * Creates an instance of ApplicationModule.
     * @param {HlfClient} hlfClient
     * @param caClient
     * @param {QueueListenerService} queueListenerService
     * @param webSocketService
     * @memberof ApplicationModule
     */
    constructor(private hlfClient: HlfClient,
                private caClient: HlfCaClient,
                private queueListenerService: QueueListenerService,
                @Inject('IEventService') private webSocketService: IEventService) {

        // init hlf client and hlf ca client
        // assign admin user
        this.hlfClient.init()
            .then(result => {
                if (!EnvConfig.BYPASS_QUEUE) {
                    Log.awssqs.info(`Starting Queue Listener...`);
                    return this.queueListenerService.listen((message, done) => {
                        Log.awssqs.debug(`Handling new queue item from ${EnvConfig.AWS_QUEUE_NAME}:`, message);

                        const {chainMethod, payload, userId} = <MessageBody>Json.deserializeJson(message.Body);
                        const pusherChannel = userId.replace(/[!|@#$%^&*]/g, '');

                        this.hlfClient.invoke(chainMethod, payload)
                            .then(() => {
                                Log.awssqs.info('HLF Transaction successful, pushing result to frontend...');
                                // notify frontend of succesful transaction
                                this.webSocketService.triggerSuccess(pusherChannel, chainMethod, payload);
                                done();
                            })
                            .catch(error => {
                                Log.awssqs.error('HLF Transaction failed:', error);
                                // notify frontend of failed transaction
                                this.webSocketService.triggerError(pusherChannel, chainMethod, {success: false});
                                done(error);
                            });

                    });
                }

                return Promise.resolve();
            })
            .then(() => {
                return this.caClient.init(Appconfig.hlf.admin);
            })
            .catch(err => {
                Log.awssqs.error(HlfErrors.ERROR_STARTING_HLF, err.message);
            });
    }

}