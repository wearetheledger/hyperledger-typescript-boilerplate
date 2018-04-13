import { Component } from '@nestjs/common';
import { HlfConfigOptions } from '../../config/config.model';

@Component()
export class HlfConfig {
    public options: HlfConfigOptions;
    public client: Client;
    public caClient: any;
    public channel: Channel;
    public targets: Peer[] = [];
    public adminUser: User;
}
