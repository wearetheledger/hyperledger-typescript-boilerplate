import { WebSocketService } from './../events/websocket.service';
import { EnvConfig } from './../../config/env';
import { Component } from '@nestjs/common';
import { Log, Utils } from 'hlf-node-utils';
import { SQS, AWSError } from 'aws-sdk';
import * as Consumer from 'sqs-consumer';
import { MessageBody } from './messagebody.model';
import { HlfClient } from '../chain/hlfclient';
import { RequestHelper } from '../chain/requesthelper';

@Component()
export class QueueListenerService {

    public sqs = new SQS();
    public queryUrl;

    /**
     * Creates an instance of QueueService.
     * @param {RequestHelper} requestHelper 
     * @memberof QueueService
     */
    constructor(
        private webSocketService: WebSocketService,
        private hlfClient: HlfClient,
    ) { }

    /**
     * Check if hlf chain is up and
     * initialize aws queue listener
     * 
     * @memberof QueueService
     */
    public init() {
        this.getQueryUrl().then(queryUrl => {
            Log.awssqs.info(`Chain is up, listening to AWS queue: ${EnvConfig.AWS_QUEUE_NAME}`);
            this.listen();
        });
    }

    /**
     * start listeneing for sqs messages
     * 
     * @private
     * @param {string} queryUrl 
     * @memberof QueueService
     */
    private listen(): void {
        // If you want to remove all the messages from the queue on every new startup
        // this.sqs.purgeQueue({
        //     QueueUrl: this.queryUrl
        // }, () => {
        //     Log.awssqs.info(`SQS queue purged: ${EnvConfig.AWS_QUEUE_NAME}`);
        // });

        const listener = Consumer.create({
            queueUrl: this.queryUrl,
            handleMessage: (message, done) => {
                Log.awssqs.debug(`Handling new queue item form ${EnvConfig.AWS_QUEUE_NAME}:`, message);
                const { chainMethod, payload, userId } = <MessageBody>Utils.deserializeJson(message.Body);
                // TODO: rework payload to pass through identity to chaincode
                this.hlfClient.invoke(chainMethod, [payload])
                    .then(result => {
                        Log.awssqs.info('HLF Transaction successful, pushing result to frontend...');
                        done();
                        // notify frontend of succesful transaction
                        this.webSocketService.trigger(userId, chainMethod, payload);
                    })
                    .catch(error => {
                        Log.awssqs.error('HLF Transaction failed');
                        done();
                        // notify frontend of failed transaction
                        this.webSocketService.trigger(userId, chainMethod, { success: false });
                    });
            }
        });

        listener.on('error', (error) => {
            Log.awssqs.error(error.message);
        });

        listener.start();
    }

    /**
     * get AWS SQS queue url
     * 
     * @private
     * @returns {Promise<string>} 
     * @memberof QueueService
     */
    private getQueryUrl(): Promise<string> {
        return new Promise((resolve, reject) => {
            this.sqs.getQueueUrl({
                QueueName: EnvConfig.AWS_QUEUE_NAME
            }, (error: AWSError, data: SQS.Types.GetQueueUrlResult) => {
                if (error) {
                    this.createNewQueue()
                        .then(result => {
                            this.queryUrl = data.QueueUrl;
                            Log.awssqs.debug('Got queue url: ' + data.QueueUrl);
                            resolve(data.QueueUrl);
                        })
                        .catch(createerror => {
                            Log.awssqs.error(createerror.message);
                            reject(createerror);
                        });
                } else {
                    this.queryUrl = data.QueueUrl;
                    Log.awssqs.debug('Got queue url: ' + data.QueueUrl);
                    resolve(data.QueueUrl);
                }
            });
        });
    }

    /**
     * Create new queue if no queueu exists
     * 
     * @private
     * @returns 
     * @memberof QueueListenerService
     */
    private createNewQueue() {
        const params = {
            QueueName: EnvConfig.AWS_QUEUE_NAME,
            Attributes: {
                'FifoQueue': 'true',
                'RedrivePolicy':
                    '{\"deadLetterTargetArn\":\"arn:aws:sqs:eu-west-1:336081765760:TLD-test-deadletter.fifo\",\"maxReceiveCount\":\"10\"}',
            }
        };
        Log.awssqs.info('Creating new queue');
        return new Promise((resolve, reject) => {
            this.sqs.createQueue(params, (error: AWSError, data: SQS.Types.CreateQueueResult) => {
                if (error) {
                    Log.awssqs.error(error.message);
                    reject(error);
                } else {
                    this.queryUrl = data.QueueUrl;
                    Log.awssqs.info('Created new queue url');
                    resolve(data.QueueUrl);
                }
            });
        });
    }
}
