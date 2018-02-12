import { EnvConfig } from './../../config/env';
import { QueueListenerService } from './queuelistener.service';
import { Component } from '@nestjs/common';
import { Log, Utils } from 'hlf-node-utils';
import { SQS, AWSError } from 'aws-sdk';
import * as ObjectHash from 'object-hash';
import { InvokeResult } from '../../routes/invokeresult.model';
import { ChainMethod } from '../../routes/chainmethods.enum';
import { MessageBody } from './messagebody.model';

@Component()
export class QueuePusherService {

    /**
     * Creates an instance of QueuePusherService.
     * @param {QueueListenerService} queueListenerService 
     * @memberof QueuePusherService
     */
    constructor(private queueListenerService: QueueListenerService) { }

    /**
     * Add transaction data onto aws queue
     * 
     * @param {ChainMethod} chainMethod 
     * @param {any[]} params 
     * @param {string} userId 
     * @memberof TransactionService
     */
    public add(chainMethod: ChainMethod, params: any[], userId: string): Promise<InvokeResult> {

        const message: MessageBody = {
            chainMethod: chainMethod,
            payload: params,
            userId: userId
        };
        
        // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SQS.html#sendMessage-property
        const msgConfig = {
            MessageBody: Utils.serializeJson(message).toString(),
            QueueUrl: this.queueListenerService.queryUrl,
            DelaySeconds: 0,
            MessageDeduplicationId: ObjectHash.sha1(params),
            MessageGroupId: userId ? userId : Math.floor(+new Date() / 1000).toString(),
            // MessageAttributes: {
            //     '<String>': {
            //         DataType: 'STRING_VALUE', /* required */
            //         BinaryListValues: [
            //             new Buffer('...') || 'STRING_VALUE' /* Strings will be Base-64 encoded on your behalf */,
            //             /* more items */
            //         ],
            //         BinaryValue: new Buffer('...') || 'STRING_VALUE' /* Strings will be Base-64 encoded on your behalf */,
            //         StringListValues: [
            //             'STRING_VALUE',
            //             /* more items */
            //         ],
            //         StringValue: 'STRING_VALUE'
            //     },
            //     /* '<String>': ... */
            // },
        };

        return new Promise((resolve, reject) => {
            this.queueListenerService.sqs.sendMessage(msgConfig, (error: AWSError, data: SQS.Types.SendMessageResult) => {
                if (error) {
                    Log.awssqs.error(`Failed to push Transaction to Queue ${EnvConfig.AWS_QUEUE_NAME}: ${error.message}`);
                    return resolve({ success: false, queueData: error });
                } else {
                    Log.awssqs.info(`Transaction pushed to Queue ${EnvConfig.AWS_QUEUE_NAME}: ${chainMethod}`);
                    return resolve({ success: true, queueData: data });
                }
            });
        });
    }

}
