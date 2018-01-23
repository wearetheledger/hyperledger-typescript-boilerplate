import { QueueListenerService } from './../awasqs/queuelistener.service';
import { FabricOptions } from 'hlf-node-utils/dist/models/fabricoptions.model';
import { HlfClient, Log } from 'hlf-node-utils';
import { EnvConfig } from './../../config/env';
import { Component } from '@nestjs/common';

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
