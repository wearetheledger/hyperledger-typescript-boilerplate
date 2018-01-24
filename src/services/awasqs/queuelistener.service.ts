import { MessageBody } from './../../models/awssqs/messagebody.model';
import { EnvConfig } from './../../config/env';
import { Component } from '@nestjs/common';
import { Log, Utils, RequestHelper } from 'hlf-node-utils';
import { SQS, AWSError } from 'aws-sdk';
import * as Consumer from 'sqs-consumer';

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
        private requestHelper: RequestHelper
    ) { }

    /**
     * Check if hlf chain is up and
     * initialize aws queue listener
     * 
     * @memberof QueueService
     */
    init() {
        this.getQueryUrl().then(queryUrl => {
            Log.awssqs.info(`Chain is up, listening to AWS queue: ${EnvConfig.AWS_QUEUE_NAME}`);
            this.listen();
        });
    }

    /**
     * start listeneing for sqs messages
     * 
     * @param {string} queryUrl 
     * @memberof QueueService
     */
    listen(): void {
        const listener = Consumer.create({
            queueUrl: this.queryUrl,
            handleMessage: (message, done) => {
                Log.awssqs.info(`Handling new queue item form ${EnvConfig.AWS_QUEUE_NAME}: ${message.Body}`);
                // TODO: notify frontend of succesful push on queue
                // const body = <MessageBody>Utils.deserializeJson(message.Body);
                // this.requestHelper.invokeRequest([body.payload], message.event)
                //     .then(result => {
                //         // TODO: notify frontend of succesful transaction
                //     })
                //     .catch(error => {
                //         Log.awssqs.error(error.message);
                //     });
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
     * @returns {Promise<string>} 
     * @memberof QueueService
     */
    getQueryUrl(): Promise<string> {
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
     * Cretae new queue if no queueu exists
     * 
     * @returns 
     * @memberof QueueListenerService
     */
    createNewQueue() {
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

    /**
     * Retry aws queue initialization
     * 
     * @param {any} err 
     * @memberof QueueService
     */
    // retryInit(error): void {
    //     if (error.message === 'Connect Failed') {
    //         if (this.maxRetries <= this.retries) {
    //             Log.awssqs.error(`After retrying ${this.maxRetries} times, still no luck. Bye!`);
    //         } else {
    //             Log.awssqs.info(`Chain not responding, retrying in ${this.retryInterval / 1000} seconds. (Attempt ${this.retries})`);
    //             setTimeout(() => {
    //                 this.retries++;
    //                 this.init();
    //             }, this.retryInterval);
    //         }
    //     }
    // }
}
