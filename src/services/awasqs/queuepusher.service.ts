import { ChainMethod } from './../routes/chainmethods.enum';
import { Component } from '@nestjs/common';
import { Log } from 'hlf-node-utils';

@Component()
export class QueuePusherService {


    constructor() { 

    }

    /**
     * invoke chaincode
     * trigger pusher message when successful
     * 
     * @param {ChainMethod} chainMethod 
     * @param {*} payload 
     * @param {string} userId 
     * @memberof TransactionService
     */
    pushToQueue(chainMethod: ChainMethod, payload: any, userId: string): void {
        Log.awssqs.info(`Pushing Transaction to Queue: ${chainMethod}`);

    }
}
