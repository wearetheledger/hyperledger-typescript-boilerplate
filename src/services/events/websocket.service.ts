import { EnvConfig } from './../../config/env';
import { Log } from 'hlf-node-utils';
import { Component } from '@nestjs/common';
import * as Pusher from 'pusher';
import { PusherOptions } from './pusheroptions.model';

@Component()
export class WebSocketService {

    private pusher = null;

    constructor() {
        this.setOptions({
            appId: EnvConfig.PUSHER_APP_ID,
            key: EnvConfig.PUSHER_KEY,
            secret: EnvConfig.PUSHER_SECRET,
            cluster: EnvConfig.PUSHER_CLUSTER,
            encrypted: true
        });
    }

    /**
     * set pusher options
     * 
     * @param {PusherOptions} options 
     * @memberof PusherService
     */
    public setOptions(options: PusherOptions) {
        this.pusher = new Pusher(options);
    }

    /**
     * trigger pusher message
     * 
     * @param {string} channel 
     * @param {string} eventName 
     * @param {*} data 
     * @returns {void} 
     * @memberof PusherService
     */
    trigger(channel: string, eventName: string, data: any): void {
        if (this.pusher) {
            return this.pusher.trigger(channel, eventName, data);
        } else {
            Log.pusher.error('Pusher options not set.');
        }
    }
}
