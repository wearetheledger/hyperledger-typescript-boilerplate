import { FabricOptions } from './fabricoptions.model';
import { Component } from '@nestjs/common';

@Component()
export class HlfConfig {

    public options: FabricOptions;
    public client: Client;
    public caClient: any;
    public channel: Channel;
    public targets: Peer[] = [];
    public txId: any;
    public adminUser;
}
