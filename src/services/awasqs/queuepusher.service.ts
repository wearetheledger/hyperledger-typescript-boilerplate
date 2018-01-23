import { InvokeResult } from './../../models/invokeresult.model';
import { QueueListenerService } from './queuelistener.service';
import { ChainMethod } from './../routes/chainmethods.enum';
import { Component } from '@nestjs/common';
import { Log, Utils } from 'hlf-node-utils';
import { SQS, AWSError } from 'aws-sdk';

@Component()
export class QueuePusherService {

    constructor(private queueListenerService: QueueListenerService) { }

    /**
     * invoke chaincode
     * trigger pusher message when successful
     * 
     * @param {ChainMethod} chainMethod 
     * @param {any[]} params 
     * @param {string} userId 
     * @memberof TransactionService
     */
    add(chainMethod: ChainMethod, params: any, userId: string): Promise<InvokeResult> {

        const paramsString = Utils.serializeJson(params);

        // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SQS.html#sendMessage-property
        const msgConfig = {
            MessageBody: paramsString,
            QueueUrl: this.queueListenerService.queryUrl,
            DelaySeconds: 0,
            MessageDeduplicationId: paramsString,
            MessageGroupId: userId,
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
                    Log.awssqs.error(`Failed to push Transaction to Queue: ${error.message} : ${Utils.deserializeJson(params)}`);
                    reject({ success: false, queueData: error });
                } else {
                    Log.awssqs.info(`Transaction pushed to Queue: ${chainMethod} : ${Utils.deserializeJson(params)}`);
                    resolve({ success: true, queueData: data });
                }
            });
        });
    }

}
