import { FabricOptions } from 'hlf-node-utils/dist/models/fabricoptions.model';
import { Component } from '@nestjs/common';
import { Log } from 'hlf-node-utils';
import { HlfClient } from '../../services/chain/hlfclient';
import { QueueListenerService } from '../../services/queue/queuelistener.service';
import { EnvConfig } from '../../config/env';

@Component()
export class PingService {

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
    }

    ping(): string {
        return 'Chain-service is alive!';
    }
}
