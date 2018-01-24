import { Component } from '@nestjs/common';
import { ChainService } from './chain.service';
import hlf = require('fabric-client');
import { FabricOptions, Log } from 'hlf-node-utils';
import { ChainMethod } from '../../routes/chainmethods.enum';

@Component()
export class HlfClient extends ChainService {

    // TODO: refactor

    /**
     * set hlf options
     * 
     * @param {FabricOptions} fabricoptions 
     * @memberof HlfClient
     */
    setOptions(fabricoptions: FabricOptions) {
        this.options = fabricoptions;
    }

    /**
     * init
     * @returns {Promise<any>} 
     * @memberof ChainService
     */
    init(): Promise<any> {
        return Promise.resolve()
            .then(() => {
                this.client = new hlf();
                return this.newDefaultKeyValueStore(this.options.walletPath);
            }).then((wallet: IKeyValueStore) => {
                this.setStateStore(wallet);
                return this.client.getUserContext(this.options.userId, true);
            }).then((user: User) => {
                if (this.isUserEnrolled(user)) {
                    this.channel = this.client.newChannel(this.options.channelId);
                    const peerObj = this.client.newPeer(this.options.networkUrl);
                    this.channel.addPeer(peerObj);
                    this.channel.addOrderer(this.client.newOrderer(this.options.ordererUrl));
                    this.targets.push(peerObj);
                }
                return true;
            }, error => {
                this.handleError(error);
            }).catch((err) => {
                this.handleError(err);
            });
    }

    /**
     * Query hlf
     * 
     * @param {ChainMethod} chainMethod 
     * @param {string[]} params 
     * @param {string} [channelId='mycc'] 
     * @returns {Promise<any>} 
     * @memberof HlfClient
     */
    query(chainMethod: ChainMethod, params: string[], channelId = 'mycc'): Promise<any> {
        return Promise.resolve()
            .then(() => {
                return this.newQuery(chainMethod, params, channelId);
            }).then((queryResponses: Buffer[]) => {
                return this.getQueryResponse(queryResponses);
            }).catch((err) => {
                this.handleError(err);
            });
    }

    /**
     * invoke 
     * @param {ChainMethod} chainMethod 
     * @param { string[]} params 
     * @param {string} channelId 
     * @returns 
     * @memberof ChainService
     */
    invoke(chainMethod: ChainMethod, params: string[], channelId = 'mycc'): Promise<any> {
        return Promise.resolve()
            .then(() => {
                return this.sendTransactionProposal(chainMethod, params, channelId);
            }).then((results: ProposalResponseObject) => {
                if (this.isProposalGood(results)) {
                    this.logSuccessfulProposalResponse(results);
                    let request: TransactionRequest = this.extractRequestFromProposalResponse(results);
                    let txPromise = this.registerTxEvent();
                    let eventPromises = [];
                    eventPromises.push(txPromise);
                    let sendPromise = this.channel.sendTransaction(request);
                    return this.concatEventPromises(sendPromise, eventPromises);
                } else {
                    Log.hlf.error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
                    throw new Error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
                }
            }, (err) => {
                Log.hlf.error(err);
                throw new Error('Failed to send proposal due to error: ' + err.stack ? err.stack : err);
            }).then((response) => {
                if (response.status === 'SUCCESS') {
                    Log.hlf.info('Successfully sent transaction to the orderer.');
                    return this.txId.getTransactionID();
                } else {
                    Log.hlf.error(`${response.status}`);
                    throw new Error(`Failed to order the transaction. Error code: ${response.status}`);
                }
            }, (err) => {
                Log.hlf.error(err);
                throw new Error('Failed to send transaction due to error: ' + err.stack ? err.stack : err);
            });
    }
}
