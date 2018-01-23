// import { Component } from '@nestjs/common';

// import { Log, HlfClient, Utils } from 'hlf-node-utils';
// import { EnvConfig } from '../config/env';
// import * as Consumer from 'sqs-consumer';
// import { SQS, AWSError, config as awsConfig } from 'aws-sdk';
// import { TransactionService } from '../transactions/transaction.service';

// // Set AWS Credentials
// awsConfig.update({
//     accessKeyId: EnvConfig.AWS_ACCESS_KEY,
//     secretAccessKey: EnvConfig.AWS_SECRET_ACCESS_KEY,
//     region: EnvConfig.AWS_REGION
// });

// @Component()
// export class QueueService {

//     private sqs = new SQS();

//     private retries = 0;
//     private maxRetries = 10;
//     private retryInterval = 10000;

//     /**
//      * Creates an instance of QueueService.
//      * @param {HlfClient} hlfClient 
//      * @param {TransactionService} transactionService 
//      * @memberof QueueService
//      */
//     constructor(
//         private hlfClient: HlfClient,
//         private transactionService: TransactionService
//     ) { }

//     /**
//      * Check if hlf chain is up and
//      * initialize aws queue listener
//      * 
//      * @memberof QueueService
//      */
//     init() {
//         this.hlfClient.init().then(response => {
//             Log.awssqs.info('Chain is up');
//             this.getQueryUrl().then(queryUrl => {
//                 this.listen(queryUrl);
//             });
//         }).catch(err => {
//             this.retryInit(err);
//         });
//     }

//     /**
//      * start listeneing for sqs messages
//      * 
//      * @param {string} queryUrl 
//      * @memberof QueueService
//      */
//     listen(queryUrl: string): void {
//         Consumer.create({
//             queueUrl: queryUrl,
//             handleMessage: (message, done) => {
//                 Log.awssqs.info(`New queue message: ${message.Body}`);
//                 const body = <MessageBody>Utils.deserializeJson(message.Body);
//                 this.transactionService.invoke(body.event, body.payload, body.userId);
//             }
//         });
//     }

//     /**
//      * get AWS SQS queue url
//      * 
//      * @returns {Promise<string>} 
//      * @memberof QueueService
//      */
//     getQueryUrl(): Promise<string> {
//         return new Promise((resolve, reject) => {
//             this.sqs.getQueueUrl({
//                 QueueName: EnvConfig.AWS_QUEUE_NAME
//             }, (err: AWSError, data: SQS.Types.GetQueueUrlResult) => {
//                 if (err) {
//                     Log.awssqs.error(err.message);
//                     reject(err);
//                 } else {
//                     Log.awssqs.info('Get url: ' + data.QueueUrl);
//                     resolve(data.QueueUrl);
//                 }
//             });
//         });
//     }

//     /**
//      * Retry aws queue initialization
//      * 
//      * @param {any} err 
//      * @memberof QueueService
//      */
//     retryInit(err): void {
//         Log.awssqs.error('Error when sending hello', err);
//         if (err.message === 'Connect Failed') {
//             if (this.maxRetries <= this.retries) {
//                 Log.awssqs.error(`After retrying ${this.maxRetries} times, still no luck. Bye!`);
//             } else {
//                 Log.awssqs.error(`(Attempt ${this.retries}) Connection with Chain service failed! Retrying in ${this.retryInterval}ms ...`);
//                 setTimeout(() => {
//                     this.retries++;
//                     this.init();
//                 }, this.retryInterval);
//             }
//         }
//     }
// }
