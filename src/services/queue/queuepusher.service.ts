import { EnvConfig } from '../../common/config/env';
import { QueueListenerService } from './queuelistener.service';
import { Component } from '@nestjs/common';
import { AWSError, SQS } from 'aws-sdk';
import * as ObjectHash from 'object-hash';
import { InvokeResult } from '../../routes/invokeresult.model';
import { ChainMethod } from '../../routes/chainmethods.enum';
import { MessageBody } from './messagebody.model';
import { Json } from '../utils/json';
import { Log } from '../logging/log.service';

@Component()
export class QueuePusherService {

    /**
     * Creates an instance of QueuePusherService.
     * @param {QueueListenerService} queueListenerService
     * @memberof QueuePusherService
     */
    constructor(private queueListenerService: QueueListenerService) {
    }

    /**
     * Add transaction data onto aws queue
     *
     * @param {ChainMethod} chainMethod
     * @param {any[]} params
     * @param {string} userId
     * @param invokeAlways - Workaround for message deduplication SQS
     * @memberof TransactionService
     */
    public add(chainMethod: ChainMethod, params: any[], userId: string, invokeAlways: boolean): Promise<InvokeResult> {

        const message: MessageBody = {
            chainMethod: chainMethod,
            payload: params,
            userId: userId
        };

        let MessageDeduplicationId = ObjectHash.sha1(ObjectHash.sha1(params) + userId);

        if (invokeAlways) {
            MessageDeduplicationId = ObjectHash.sha1(MessageDeduplicationId + Date.now());
        }

        // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SQS.html#sendMessage-property
        const msgConfig = {
            MessageBody: Json.serializeJson(message),
            QueueUrl: this.queueListenerService.queryUrl,
            DelaySeconds: 0,
            MessageDeduplicationId,
            MessageGroupId: userId ? userId : Math.floor(+new Date() / 1000).toString(),
            // MessageAttributes - other possible field
        };

        return new Promise((resolve, reject) => {
            this.queueListenerService.sqs.sendMessage(msgConfig, (error: AWSError, data: SQS.Types.SendMessageResult) => {
                if (error) {
                    Log.awssqs.error(`Failed to push Transaction to Queue ${EnvConfig.AWS_QUEUE_NAME}: ${error.message}`);
                    return resolve({success: false, queueData: error});
                } else {
                    Log.awssqs.info(`Transaction pushed to Queue ${EnvConfig.AWS_QUEUE_NAME}: ${chainMethod}`);
                    return resolve({success: true, queueData: data});
                }
            });
        });
    }

}
