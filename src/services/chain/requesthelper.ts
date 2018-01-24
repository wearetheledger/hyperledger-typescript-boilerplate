import { Utils, Log } from 'hlf-node-utils';
import { Component } from '@nestjs/common';
import { HlfClient } from './hlfclient';
import { QueuePusherService } from '../queue/queuepusher.service';
import { ChainMethod } from '../../routes/chainmethods.enum';
import { InvokeResult } from '../../routes/invokeresult.model';

@Component()
export class RequestHelper {

    constructor(
        private hlfClient: HlfClient,
        private queuePusherService: QueuePusherService) { }

    /**
     * Pass transaction request to aws queue
     * 
     * @param {ChainMethod} chainMethod 
     * @param {any[]} params 
     * @param {string} userId 
     * @returns {Promise<{ success: boolean }>} 
     * @memberof RequestHelper
     */
    public invokeRequest(chainMethod: ChainMethod, params: any[], userId: string): Promise<InvokeResult> {
        Utils.stringifyParams(params);
        return this.queuePusherService.add(chainMethod, params, userId)
            .then((response) => {
                Log.config.info('Valid transaction');
                return response;
            })
            .catch(error => {
                Log.config.error(`${chainMethod} error`, error);
                throw new Error(`${chainMethod} error`);
            });
    }

    /**
     * Query hlf chain and return response
     * 
     * @param {ChainMethod} chainMethod 
     * @param {any[]} params 
     * @returns {Promise<any>} 
     * @memberof RequestHelper
     */
    public queryRequest(chainMethod: ChainMethod, params: any[]): Promise<any> {
        Utils.stringifyParams(params);
        return this.hlfClient.query(chainMethod, params)
            .then((response) => {
                Log.config.info('Valid query');
                return response;
            })
            .catch(error => {
                Log.grpc.error(`${chainMethod} error`, error);
                throw error;
            });
    }

    /**
     * validate requests with yup
     * @param {Schema} schema 
     * @param {any} body 
     * @returns {Promise<any>} 
     * @memberof RequestHelper
     */
    public validateRequest(schema: Schema, body): Promise<any[]> {
        return schema.validate(body)
            .then(params => params)
            .catch((error) => {
                Log.config.error('Validation error', error);
                throw error;
            });
    }

}
