import { Injectable } from '@nestjs/common';
import { Channel, Peer, User } from 'fabric-client';
import Client = require('fabric-client');
import { HlfConfigOptions } from '../../common/config/config.model';
import FabricCAServices = require('fabric-ca-client');

@Injectable()
export class HlfConfig {
    public options: HlfConfigOptions;
    public client: Client;
    public caClient: FabricCAServices;
    public channel: Channel;
    public targets: Peer[] = [];
    public adminUser: User;
}
