import { Injectable, Provider } from '@nestjs/common';
import { HlfErrors, HlfInfo } from './logging.enum';
import { HlfConfig } from './hlfconfig';
import {
    ChaincodeInvokeRequest,
    ChaincodeQueryRequest,
    IKeyValueStore,
    ProposalResponseObject,
    User
} from 'fabric-client';
import { Log } from '../../common/utils/logging/log.service';
import Client = require('fabric-client');

@Injectable()
export abstract class ChainService {

    // TODO: refactor

    protected constructor(public hlfConfig: HlfConfig) {
    }

    /**
     * Wrapper around the newDefaultKeyValueStore function
     *
     * @param {string} walletPath
     * @returns {Promise<IKeyValueStore>}
     */
    protected newDefaultKeyValueStore(walletPath: string): Promise<IKeyValueStore> {
        Log.hlf.info(HlfInfo.CREATING_CLIENT);
        return Client.newDefaultKeyValueStore({ path: walletPath });
    }

    /**
     * Wrapper around the setStateStore function
     *
     * @param {IKeyValueStore} wallet
     */
    protected setStateStore(wallet: IKeyValueStore): void {
        Log.hlf.info(HlfInfo.SET_WALLET_PATH, this.hlfConfig.options.userId);
        Log.hlf.debug(HlfInfo.WALLET, JSON.stringify(wallet));
        this.hlfConfig.client.setStateStore(wallet);
    }

    /**
     * Wrapper around the getUserContext function
     *
     * @param {string} userId
     * @returns {Promise<User>}
     */
    protected getUserContext(userId: string): Promise<User> {
        return <Promise<User>>this.hlfConfig.client.getUserContext(userId, true);
    }

    /**
     * Check if a user is enrolled
     *
     * @param user
     * @returns {boolean}
     */
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
        throw err;
    }

    /**
     * Create new query transaction
     *
     * @param {string} requestFunction
     * @param {string[]} requestArguments
     * @param {string} chaincodeId
     * @param transientMap
     * @returns {Promise<Buffer[]>}
     */
    protected newQuery(requestFunction: string, requestArguments: string[], chaincodeId: string, transientMap?: Object): Promise<Buffer[]> {
        const txId = this.hlfConfig.client.newTransactionID();
        Log.hlf.debug(HlfInfo.ASSIGNING_TRANSACTION_ID, txId.getTransactionID());
        const request: ChaincodeQueryRequest = {
            chaincodeId: chaincodeId,
            fcn: requestFunction,
            args: requestArguments,
            transientMap: transientMap
        };
        return this.hlfConfig.channel.queryByChaincode(request);
    }

    /**
     * Get actual reponse from response buffers
     *
     * @param {Buffer[]} queryResponses
     * @returns {object}
     */
    protected getQueryResponse(queryResponses: Buffer[]): object {
        if (!queryResponses.length) {
            Log.hlf.debug(HlfInfo.NO_PAYLOADS_RETURNED);
        } else {
            if (queryResponses[0] instanceof Error) {
                return this.handleError(queryResponses[0].toString());
            }
        }
        Log.hlf.debug(HlfInfo.RESPONSE_IS, queryResponses[0].toString());

        if (!queryResponses[0].toString().length) {
            return null;
        }

        return JSON.parse(queryResponses[0].toString());
    }

    /**
     * Create and send new invoke transaction proposal
     *
     * @param {string} requestFunction
     * @param {string[]} requestArguments
     * @param {string} chaincodeId
     * @param transientMap
     * @returns {Promise<{txHash: string; buffer: ProposalResponseObject}>}
     */
    protected sendTransactionProposal(requestFunction: string, requestArguments: string[], chaincodeId: string, transientMap?: Object): Promise<{ txHash: string; buffer: ProposalResponseObject }> {
        const txId: any = this.hlfConfig.client.newTransactionID();
        Log.hlf.debug(HlfInfo.ASSIGNING_TRANSACTION_ID, txId._transaction_id);

        let request: ChaincodeInvokeRequest = {
            targets: this.hlfConfig.targets,
            chaincodeId: chaincodeId,
            fcn: requestFunction,
            args: requestArguments,
            transientMap: transientMap,
            txId: txId
        };

        return this.hlfConfig.channel.sendTransactionProposal(request)
            .then(proposalResponse => {
                return { txHash: txId._transaction_id, buffer: proposalResponse };
            });
    }

    /**
     * Check if the proposal response is good
     *
     * @param {ProposalResponseObject} results
     * @returns {boolean}
     */
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

    /**
     * Listen and wait for transaction comitting on peer
     *
     * @param transactionID
     * @returns {Promise<any>}
     */
    protected registerTxEvent(transactionID: string): Promise<any> {

        const peer = this.hlfConfig.targets[0];

        if (!peer) {
            throw new Error('No peers attached');
        }

        let eh = this.hlfConfig.channel.newChannelEventHub(peer);

        return new Promise((resolve, reject) => {
            let handle = setTimeout(() => {
                eh.unregisterTxEvent(transactionID);
                eh.disconnect();
                Log.hlf.error(HlfErrors.TRANSACTION_TIMED_OUT, transactionID);
                reject(new Error('Transaction did not complete within 30 seconds'));
            }, 3000);

            eh.registerTxEvent(transactionID, (tx, code) => {
                // this is the callback for transaction event status
                // first some clean up of event listener
                clearTimeout(handle);

                // now let the application know what happened
                const status = { event_status: code, tx_id: transactionID };

                if (code !== 'VALID') {
                    Log.hlf.error(HlfErrors.INVALID_TRANSACTION, code);
                    resolve(status); // we could use reject(new Error('Problem with the tranaction, event status ::'+code));
                } else {
                    Log.hlf.debug(HlfInfo.COMMITTED_ON_PEER, eh.getPeerAddr());
                    resolve(status);
                }
            }, (err) => {
                //this is the callback if something goes wrong with the event registration or processing
                reject(new Error('There was a problem with the eventhub ::' + err));
            },
                { disconnect: true } //disconnect when complete
            );

            Log.hlf.info(HlfInfo.CONNECTING_EVENTHUB);

            eh.connect();

        });
    }
}
