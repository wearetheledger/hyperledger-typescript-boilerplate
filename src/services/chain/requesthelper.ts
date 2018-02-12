import { Utils, Log } from 'hlf-node-utils';
import { Component } from '@nestjs/common';
import { HlfClient } from './hlfclient';
import { QueuePusherService } from '../queue/queuepusher.service';
import { ChainMethod } from '../../routes/chainmethods.enum';
import { InvokeResult } from '../../routes/invokeresult.model';

@Component()
export class RequestHelper {

    // TODO: refactor invokes according to https://docs.nestjs.com/recipes/cqrs

    /**
     * Creates an instance of RequestHelper.
     * @param {HlfClient} hlfClient 
     * @param {QueuePusherService} queuePusherService 
     * @memberof RequestHelper
     */
    constructor(
        private hlfClient: HlfClient,
        private queuePusherService: QueuePusherService) { }

    /**
     * Pass transaction request to aws queue
     * 
     * @param {ChainMethod} chainMethod 
     * @param {any} params 
     * @param {string} userId 
     * @returns {Promise<InvokeResult>} 
     * @memberof RequestHelper
     */
    public invokeRequest(chainMethod: ChainMethod, params: any, userId: string): Promise<InvokeResult> {
        let stringifyParams: string[] = [];
        Object.keys(params).reverse().forEach((key) => {
            stringifyParams.push(params[key]);
        });
        return this.queuePusherService.add(chainMethod, stringifyParams, userId)
            .then((response) => {
                Log.awssqs.debug('Invoke successfully added to SQS queue: ', response);
                return Promise.resolve(response);
            })
            .catch(error => {
                Log.config.error(`${chainMethod}`, error);
                return Promise.reject(error);
            });
    }

    /**
     * Query hlf chain and return response
     * 
     * @param {ChainMethod} chainMethod 
     * @param {any[]} params 
     * @param {string} userId 
     * @returns {Promise<any>} 
     * @memberof RequestHelper
     */
    public queryRequest(chainMethod: ChainMethod, params: any[], userId: string): Promise<any> {
        Utils.stringifyParams(params);
        return this.hlfClient.query(chainMethod, params)
            .then((response) => {
                Log.hlf.debug('Query successfully executed: ', response);
                return Promise.resolve(response);
            })
            .catch(error => {
                Log.hlf.error(`${chainMethod}`, error);
                return Promise.reject(error);
            });
    }

    /**
     * validate requests with yup
     * 
     * @param {Schema} schema 
     * @param {any} body 
     * @returns {Promise<any>} 
     * @memberof RequestHelper
     */
    public validateRequest(schema: Schema, body): Promise<any[]> {
        return schema.validate(body)
            .then(params => {
                Log.config.debug('Valid object schema: ', params);
                return Promise.resolve(params);
            })
            .catch((error) => {
                Log.config.error('Validation', error);
                return Promise.reject(error);
            });
    }

}
