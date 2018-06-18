import { Injectable } from '@nestjs/common';
import { AWSError, SQS } from 'aws-sdk';
import * as Consumer from 'sqs-consumer';
import { Log } from '../../common/utils/logging/log.service';
import { EnvConfig } from '../../common/config/env';

interface IHandleQueueMessage {
    (message: any, done: any): void;
}

@Injectable()
export class QueueListenerService {

    public sqs = new SQS();
    public queryUrl;

    /**
     * start listeneing for sqs messages
     *
     * @private
     * @memberof QueueService
     */
    public async listen(handleMessage: IHandleQueueMessage): Promise<any> {

        await this.init();

        // If you want to remove all the messages from the queue on every new startup
        if (EnvConfig.PURGE_QUEUE_ON_STARTUP) {
            this.sqs.purgeQueue({
                QueueUrl: this.queryUrl
            }, () => {
                Log.awssqs.info(`SQS queue purged: ${EnvConfig.AWS_QUEUE_NAME}`);
            });
        }

        const listener = Consumer.create({
            queueUrl: this.queryUrl,
            handleMessage: handleMessage
        });

        listener.on('error:', (error) => {
            Log.awssqs.error(error);
        });
        listener.on('processing_error', (error) => {
            Log.awssqs.debug('processing_error:', error);
        });
        listener.on('message_received', (data) => {
            Log.awssqs.debug('message_received', data);
        });
        listener.on('message_processed', (data) => {
            Log.awssqs.debug('message_processed:', data);
        });
        listener.on('response_processed', () => {
            Log.awssqs.debug('processed');
        });
        listener.on('stopped', () => {
            Log.awssqs.debug('stopped');
        });
        listener.on('empty', () => {
            Log.awssqs.debug('heartbeat...');
        });
        listener.start();
    }

    /**
     * Check if hlf chain is up and
     * initialize aws queue listener
     *
     * @memberof QueueService
     */
    private init() {
        this.getQueryUrl()
            .then(queryUrl => {
                Log.awssqs.info(`Listening to AWS queue: ${EnvConfig.AWS_QUEUE_NAME}`);
                this.queryUrl = queryUrl;
            })
            .catch(err => {
                Log.awssqs.error(err.message);
            });
    }

    /**
     * get AWS SQS queue url
     *
     * @private
     * @returns {Promise<string>}
     * @memberof QueueService
     */
    private getQueryUrl(): Promise<string> {

        return this.sqs.getQueueUrl({
            QueueName: EnvConfig.AWS_QUEUE_NAME
        }).promise()
            .then((data: SQS.Types.GetQueueUrlResult) => {

                Log.awssqs.debug('Got queue url: ' + data.QueueUrl);
                return data.QueueUrl;

            }).catch((error: AWSError) => {
                return this.createNewQueue()
                    .then(result => {
                        Log.awssqs.debug('Got queue url: ' + result);
                        return result;
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
    private createNewQueue(): Promise<string> {
        const params = {
            QueueName: EnvConfig.AWS_QUEUE_NAME,
            Attributes: {
                'FifoQueue': 'true',
            }
        };

        if (EnvConfig.DEAD_LETTER_QUEUE_ARN) {
            params.Attributes['RedrivePolicy'] = JSON.stringify({
                deadLetterTargetArn: EnvConfig.DEAD_LETTER_QUEUE_ARN,
                maxReceiveCount: 10
            });
        }

        Log.awssqs.info('Creating new queue');

        return this.sqs.createQueue(params).promise()
            .then((data: SQS.Types.CreateQueueResult) => {
                Log.awssqs.info('Created new queue url');

                return data.QueueUrl;
            });
    }
}
