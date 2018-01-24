import { Log } from 'hlf-node-utils';
import { Component } from '@nestjs/common';
import hlf = require('fabric-client');
import { util } from 'type-util';

@Component()
export abstract class ChainService {

    // TODO: refactor
    
    protected options: {
        walletPath: string;
        userId: string;
        channelId: string;
        networkUrl: string;
        eventUrl: string;
        ordererUrl: string;
    };

    protected client: Client;
    protected channel: Channel;
    protected targets: Peer[] = [];
    protected txId: any;

    protected newDefaultKeyValueStore(walletPath: string): Promise<IKeyValueStore> {
        Log.hlf.debug(`WALLET PATH: ${this.options.walletPath}`);
        Log.hlf.info('Create a client and set the wallet location');
        return hlf.newDefaultKeyValueStore({ path: walletPath });
    }

    protected setStateStore(wallet: IKeyValueStore): void {
        Log.hlf.info('Set wallet path, and associate user ', this.options.userId, ' with application');
        Log.hlf.info(`WALLET: ${JSON.stringify(wallet)}`);
        this.client.setStateStore(wallet);
    }

    protected getUserContext(userId: string): Promise<User> {
        return this.client.getUserContext(userId, true);
    }

    protected isUserEnrolled(user): boolean {
        Log.hlf.info('Checking if user is enrolled');
        if (user === undefined || user == null || user.isEnrolled() === false) {
            Log.hlf.error('User not defined, or not enrolled. Or network is down');
            return false;
        }
        Log.hlf.info('User is enrolled, setting query URL in the network');
        return true;
    }

    protected handleError(err): Promise<any> {
        Log.hlf.error('Caught Error', err);
        return Promise.reject(new Error('Blockchain is not running'));
    }

    protected newQuery(requestFunction: string, requestArguments: string[], chaincodeId: string): Promise<Buffer[]> {
        Log.hlf.info('Make query');
        const transactionId = this.client.newTransactionID();
        Log.hlf.info('Assigning transaction_id: ', transactionId.getTransactionID());
        const request: ChaincodeQueryRequest = {
            chaincodeId: chaincodeId,
            txId: transactionId,
            fcn: requestFunction,
            args: requestArguments,
        };
        return this.channel.queryByChaincode(request);
    }

    protected getQueryResponse(queryResponses: Buffer[]): object {
        if (!queryResponses.length) {
            Log.hlf.info('No payloads were returned from query');
        } else {
            Log.hlf.info('Query result count = ', queryResponses.length);
        }
        if (queryResponses[0] instanceof Error) {
            throw new Error(queryResponses[0].toString());
        }
        Log.hlf.info('Response is ', queryResponses[0].toString());
        return JSON.parse(queryResponses[0].toString());
    }

    protected sendTransactionProposal(requestFunction: string, requestArguments: string[], chaincodeId: string): Promise<ProposalResponseObject> {
        this.txId = this.client.newTransactionID();
        Log.hlf.info('Assigning transaction_id: ', this.txId._transaction_id);

        let request: ChaincodeInvokeRequest = {
            targets: this.targets,
            chaincodeId: chaincodeId,
            fcn: requestFunction,
            args: requestArguments,
            chainId: this.options.channelId,
            txId: this.txId
        };
        return this.channel.sendTransactionProposal(request);
    }

    protected isProposalGood(results: ProposalResponseObject): boolean {
        let proposalResponses = results[0];
        let isProposalGood = false;
        if (proposalResponses && proposalResponses[0].response &&
            proposalResponses[0].response.status === 200) {
            isProposalGood = true;
            Log.hlf.info('transaction proposal was good');
        } else {
            Log.hlf.error('transaction proposal was bad');
        }
        return isProposalGood;
    }

    protected logSuccessfulProposalResponse(results): void {
        let proposalResponses = results[0];
        Log.hlf.info(util.format(
            'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s"',
            proposalResponses[0].response.status, proposalResponses[0].response.message));
    }

    protected extractRequestFromProposalResponse(results: ProposalResponseObject): TransactionRequest {
        return {
            proposalResponses: results[0],
            proposal: results[1],
            header: results[2],
        };
    }

    protected registerTxEvent(): Promise<any> {
        // set the transaction listener and set a timeout of 30sec
        // if the transaction did not get committed within the timeout period,
        // fail the test
        let transactionID = this.txId.getTransactionID();
        let eh = this.client.newEventHub();
        eh.setPeerAddr(this.options.eventUrl);
        eh.connect();

        return new Promise((resolve, reject) => {
            let handle = setTimeout(() => {
                eh.disconnect();
                Log.hlf.error('The transaction has timed out: ' + transactionID);
                reject();
            }, 30000);
            eh.registerTxEvent(transactionID, (tx, code) => {
                clearTimeout(handle);
                eh.unregisterTxEvent(transactionID);
                eh.disconnect();
                if (code !== 'VALID') {
                    Log.hlf.error('The transaction was invalid, code = ' + code);
                    reject();
                } else {
                    Log.hlf.info('The transaction has been committed on peer ' + eh.getPeerAddr());
                    resolve();
                }
            });
        });
    }

    protected concatEventPromises(sendPromise, eventPromises): Promise<any> {
        return Promise.all([sendPromise].concat(eventPromises)).then((results) => {
            Log.hlf.info('Event promise all complete and testing complete');
            return results[0]; // the first returned value is from the 'sendPromise' which is from the 'sendTransaction()' call
        }).catch((err) => {
            Log.hlf.error(`Failed to send transaction and get notifications within the timeout period: ${err}`);
            throw new Error(`Failed to send transaction and get notifications within the timeout period: ${err}`);
        });
    }
}
