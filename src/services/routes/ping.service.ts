import { FabricOptions } from 'hlf-node-utils/dist/models/fabricoptions.model';
import { HlfClient } from 'hlf-node-utils';
import { EnvConfig } from './../../config/env';
import { Component } from '@nestjs/common';
import { Observable } from 'rxjs';

@Component()
export class PingService {

    /**
     * Creates an instance of PingService.
     * Will init the hlf client
     * @param {HlfClient} hlfClient 
     * @memberof PingService
     */
    constructor(private hlfClient: HlfClient) {

        this.hlfClient.setOptions(<FabricOptions>{
            walletPath: `./src/config/creds`,
            userId: 'PeerAdmin',
            channelId: 'mychannel',
            networkUrl: `grpc://${EnvConfig.PEER_HOST}:7051`,
            eventUrl: `grpc://${EnvConfig.PEER_HOST}:7053`,
            ordererUrl: `grpc://${EnvConfig.ORDERER_HOST}:7050`
        });

        this.hlfClient.init();
    }

    ping() {
        return Observable.of('Chain-service is alive!');
    }
}
