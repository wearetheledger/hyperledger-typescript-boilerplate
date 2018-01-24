import { SQS, AWSError } from 'aws-sdk';

export class InvokeResult {
    readonly success: boolean;
    readonly queueData: SQS.Types.SendMessageResult | AWSError;
}