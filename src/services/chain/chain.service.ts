import { Component } from '@nestjs/common';
import { HlfErrors, HlfInfo } from './logging.enum';
import { Log } from '../logging/log.service';
import { HlfConfig } from './hlfconfig';

@Component()
export abstract class ChainService {

    // TODO: refactor

    constructor(public hlfConfig: HlfConfig){}

    protected newDefaultKeyValueStore(walletPath: string): Promise<IKeyValueStore> {
        Log.hlf.info(HlfInfo.CREATING_CLIENT);
        return this.hlfConfig.client.newDefaultKeyValueStore({ path: walletPath });
    }

    protected setStateStore(wallet: IKeyValueStore): void {
        Log.hlf.info(HlfInfo.SET_WALLET_PATH, this.hlfConfig.options.userId);
        Log.hlf.debug(HlfInfo.WALLET, JSON.stringify(wallet));
        this.hlfConfig.client.setStateStore(wallet);
    }

    protected getUserContext(userId: string): Promise<User> {
        return this.hlfConfig.client.getUserContext(userId, true);
    }

    protected isUserEnrolled(user): boolean {
        Log.hlf.info(HlfInfo.CHECK_USER_ENROLLED);
        if (user === undefined || user == null || user.isEnrolled() === false) {
            Log.hlf.error(HlfErrors.NO_ENROLLED_USER);
            return false;
        }
        Log.hlf.info(HlfInfo.USER_ENROLLED, user);
        return true;
    }

    protected handleError(err): Promise<any> {
        Log.hlf.error(err);
        return Promise.reject(err);
    }

    protected newQuery(requestFunction: string, requestArguments: string[], chaincodeId: string): Promise<Buffer[]> {
        const transactionId = this.hlfConfig.client.newTransactionID();
        Log.hlf.debug(HlfInfo.ASSIGNING_TRANSACTION_ID, transactionId.getTransactionID());
        const request: ChaincodeQueryRequest = {
            chaincodeId: chaincodeId,
            txId: transactionId,
            fcn: requestFunction,
            args: requestArguments,
        };
        return this.hlfConfig.channel.queryByChaincode(request);
    }

    protected getQueryResponse(queryResponses: Buffer[]): object {
        if (!queryResponses.length) {
            Log.hlf.debug(HlfInfo.NO_PAYLOADS_RETURNED);
        } else {
            Log.hlf.debug(HlfInfo.PAYLOAD_RESULT_COUNT, queryResponses.length);
            if (queryResponses[0] instanceof Error) {
                return this.handleError(queryResponses[0].toString());
            }
        }
        Log.hlf.debug(HlfInfo.RESPONSE_IS, queryResponses[0].toString());
        return JSON.parse(queryResponses[0].toString());
    }

    protected sendTransactionProposal(requestFunction: string, requestArguments: string[], chaincodeId: string): Promise<ProposalResponseObject> {
        this.hlfConfig.txId = this.hlfConfig.client.newTransactionID();
        Log.hlf.debug(HlfInfo.ASSIGNING_TRANSACTION_ID, this.hlfConfig.txId._transaction_id);

        let request: ChaincodeInvokeRequest = {
            targets: this.hlfConfig.targets,
            chaincodeId: chaincodeId,
            fcn: requestFunction,
            args: requestArguments,
            chainId: this.hlfConfig.options.channelId,
            txId: this.hlfConfig.txId
        };

        return this.hlfConfig.channel.sendTransactionProposal(request);
    }

    protected isProposalGood(results: ProposalResponseObject): boolean {
        let proposalResponses = results[0];
        let isProposalGood = false;
        if (proposalResponses && proposalResponses[0].response &&
            proposalResponses[0].response.status === 200) {
            isProposalGood = true;
            Log.hlf.debug(HlfInfo.GOOD_TRANSACTION_PROPOSAL);
        } else {
            Log.hlf.error(HlfErrors.BAD_TRANSACTION_PROPOSAL);
        }
        return isProposalGood;
    }

    protected logSuccessfulProposalResponse(results): void {
        let proposalResponses = results[0];
        Log.hlf.debug(HlfInfo.SUCCESFULLY_SENT_PROPOSAL, proposalResponses[0].response.status, proposalResponses[0].response.message);
    }

    protected registerTxEvent(): Promise<any> {
        // set the transaction listener and set a timeout of 30sec
        // if the transaction did not get committed within the timeout period,
        // fail the test
        let transactionID = this.hlfConfig.txId.getTransactionID();
        let eh = this.hlfConfig.client.newEventHub();
        eh.setPeerAddr(this.hlfConfig.options.eventUrl);
        Log.hlf.info(HlfInfo.CONNECTING_EVENTHUB);
        eh.connect();

        return new Promise((resolve, reject) => {
            let handle = setTimeout(() => {
                eh.disconnect();
                Log.hlf.error(HlfErrors.TRANSACTION_TIMED_OUT, transactionID);
                reject();
            }, 30000);
            eh.registerTxEvent(transactionID, (tx, code) => {
                clearTimeout(handle);
                eh.unregisterTxEvent(transactionID);
                eh.disconnect();
                if (code !== 'VALID') {
                    Log.hlf.error(HlfErrors.INVALID_TRANSACTION, code);
                    reject();
                } else {
                    Log.hlf.debug(HlfInfo.COMMITTED_ON_PEER, eh.getPeerAddr());
                    resolve();
                }
            });
        });
    }

    protected concatEventPromises(sendPromise, eventPromises): Promise<any> {
        return Promise.all([sendPromise].concat(eventPromises)).then((results) => {
            Log.hlf.info(HlfInfo.EVENT_PROMISES_COMPLETE);
            return results[0]; // the first returned value is from the 'sendPromise' which is from the 'sendTransaction()' call
        }).catch((err) => {
            Log.hlf.error(HlfErrors.FAILED_TO_SEND_TX, err);
            return this.handleError(err);
        });
    }
}
