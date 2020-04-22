import { Inject, Injectable } from '@nestjs/common';
import { ChainMethod } from '../../chainmethods.enum';
import { EnvConfig } from '../../common/config/env';
import { InvokeResult } from '../../common/utils/invokeresult.model';
import { Log } from '../../common/utils/logging/log.service';
import { IEventService } from '../events/interfaces/event.interface';
import { PusherService } from '../events/pusher/pusher.service';
import { HlfClient } from './hlfclient';
import { TransientMap } from 'fabric-client';

@Injectable()
export class RequestHelper {
    // TODO: refactor invokes according to https://docs.nestjs.com/recipes/cqrs

    /**
     * Creates an instance of RequestHelper.
     * @param {HlfClient} hlfClient
     * @param {PusherService} eventService
     * @memberof RequestHelper
     */
    constructor(private hlfClient: HlfClient,
        @Inject('IEventService') private eventService: IEventService
    ) {
    }

    /**
     * 
     *
     * @param {ChainMethod} chainMethod
     * @param {Object} params
     * @param {string} userId
     * @param invokeAlways - Workaround for message deduplication SQS
     * @param transientMap
     * @returns {Promise<InvokeResult>}
     * @memberof RequestHelper
     */
    public invokeRequest(chainMethod: ChainMethod, params: Object, userId?: string, invokeAlways = false, transientMap?: TransientMap): Promise<InvokeResult | any> {
        const args = [JSON.stringify(params)];

        return this.hlfClient
            .invoke(chainMethod, args, transientMap)
            .then((response) => {
                Log.hlf.debug('Invoke successfully executed: ', response);
                if (userId) {
                    this.eventService.triggerSuccess(userId, chainMethod, params);
                }
                return { txHash: response };
            })
            .catch((error) => {
                Log.hlf.error(`${chainMethod}`, error);
                this.eventService.triggerError(userId || 'UNKNOWN_USER', chainMethod, params);
                throw error;
            });

    }

    /**
     * Query hlf chain and return response
     *
     * @param {ChainMethod} chainMethod
     * @param {Object} params
     * @param transientMap
     * @returns {Promise<any>}
     * @memberof RequestHelper
     */
    public queryRequest(chainMethod: ChainMethod, params: Object = {}, transientMap?: TransientMap): Promise<any> {
        const args = [JSON.stringify(params)];

        return this.hlfClient
            .query(chainMethod, args, transientMap)
            .then((response) => {
                Log.hlf.debug('Query successfully executed!');
                return response;
            })
            .catch((error) => {
                Log.hlf.error(`${chainMethod}`, error);
                throw error;
            });
    }
}
