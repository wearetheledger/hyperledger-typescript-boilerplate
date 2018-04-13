import { EnvConfig } from '../../../config/env';
import { Component } from '@nestjs/common';
import * as Pusher from 'pusher';
import { Log } from '../../logging/log.service';
import { IEventService } from '../event.interface';

@Component()
export class PusherService implements IEventService {

    public pusher: Pusher;

    /**
     * Creates an instance of PusherService.
     * @memberof PusherService
     */
    constructor() {
        this.pusher = new Pusher({
            appId: EnvConfig.PUSHER_APP_ID,
            key: EnvConfig.PUSHER_KEY,
            secret: EnvConfig.PUSHER_SECRET,
            cluster: EnvConfig.PUSHER_CLUSTER,
            encrypted: true
        });
    }

    /**
     * Trigger success event message using predefined format
     *
     * @example {
     *               "event": eventName,
     *               "data": data
     *           }
     *
     * @param {string} channel - Channel to push messages to
     * @param {string} eventName - Part of the payload
     * @param {*} data - Part of the payload
     * @returns {void}
     * @memberof EventInterface
     */
    triggerSuccess(channel: string, eventName: string, data: any): void {

        console.log('pusherbtriggerSuccess')
        if (this.pusher) {
            this.pusher.trigger(channel, 'success',
                {
                    event: eventName,
                    data: data
                });
        } else {
            Log.pusher.error('Pusher options not set.');
        }
    }

    /**
     * Trigger error event message using predefined format
     *
     * @example {
     *               "event": eventName,
     *               "data": data
     *           }
     *
     * @param {string} channel - Channel to push messages to
     * @param {string} eventName - Part of the payload
     * @param {*} data - Part of the payload
     * @returns {void}
     * @memberof EventInterface
     */
    triggerError(channel: string, eventName: string, data: any): void {
        if (this.pusher) {
            this.pusher.trigger(channel, 'error',
                {
                    event: eventName,
                    data: data
                });
        } else {
            Log.pusher.error('Pusher options not set.');
        }
    }

    /**
     * Trigger custom event message
     *
     * @param {string} channel - Channel to push messages to
     * @param {string} eventName - Actual event
     * @param {*} data - Part of the payload
     * @returns {void}
     * @memberof EventInterface
     */
    triggerCustom(channel: string, eventName: string, data: any): void {
        if (this.pusher) {
            this.pusher.trigger(channel, eventName, data);
        } else {
            Log.pusher.error('Pusher options not set.');
        }
    }
}
