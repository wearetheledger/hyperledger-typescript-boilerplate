import { WebSocketService } from './../events/websocket.service';
import { EnvConfig } from './../../config/env';
import { Component } from '@nestjs/common';
import { Log, Utils, RequestHelper } from 'hlf-node-utils';
import { SQS, AWSError } from 'aws-sdk';
import * as Consumer from 'sqs-consumer';
import { MessageBody } from './messagebody.model';

@Component()
export class QueueListenerService {

    public sqs = new SQS();
    public queryUrl;

    // private retries = 0;
    // private maxRetries = 10;
    // private retryInterval = 10000;

    /**
     * Creates an instance of QueueService.
     * @param {RequestHelper} requestHelper 
     * @memberof QueueService
     */
    constructor(
        private requestHelper: RequestHelper,
        private webSocketService: WebSocketService
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
        const listener = Consumer.create({
            queueUrl: this.queryUrl,
            handleMessage: (message, done) => {
                Log.awssqs.info(`Handling new queue item form ${EnvConfig.AWS_QUEUE_NAME}: ${message.Body}`);
                const body = <MessageBody>Utils.deserializeJson(message.Body);
                this.requestHelper.invokeRequest([body.payload], message.event)
                    .then(result => {
                        // notify frontend of succesful transaction
                        this.webSocketService.trigger(body.userId, body.event, body.payload);
                        done();
                    })
                    .catch(error => {
                        Log.awssqs.error(error.message);
                        done();
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
                            Log.awssqs.info('Got queue url: ' + data.QueueUrl);
                            resolve(data.QueueUrl);
                        })
                        .catch(createerror => {
                            Log.awssqs.error(createerror.message);
                            reject(createerror);
                        });
                } else {
                    this.queryUrl = data.QueueUrl;
                    Log.awssqs.info('Got queue url: ' + data.QueueUrl);
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
                    Log.awssqs.info('Created new queue url: ' + data.QueueUrl);
                    resolve(data.QueueUrl);
                }
            });
        });
    }
}
