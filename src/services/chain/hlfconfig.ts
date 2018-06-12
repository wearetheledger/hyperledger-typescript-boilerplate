import { Injectable } from '@nestjs/common';
import { HlfConfigOptions } from '../../common/config/config.model';
import { Channel, Peer, User } from 'fabric-client';
import Client = require('fabric-client');

@Injectable()
export class HlfConfig {
    public options: HlfConfigOptions;
    public client: Client;
    public caClient: any;
    public channel: Channel;
    public targets: Peer[] = [];
    public adminUser: User;
}
