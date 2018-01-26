import { HlfErrors, HlfInfo } from './logging.enum';
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
        this.client = new hlf();
        return this.newDefaultKeyValueStore(this.options.walletPath)
            .then((wallet: IKeyValueStore) => {
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
                Log.hlf.info(HlfInfo.INIT_SUCCESS);
                return Promise.resolve(true);
            }).catch((err) => {
                return Promise.reject(err);
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
        return this.newQuery(chainMethod, params, channelId)
            .then((queryResponses: Buffer[]) => {
                return this.getQueryResponse(queryResponses);
            }).catch((err) => {
                return Promise.reject(err);
            });
    }

    /**
     * invoke 
     * 
     * @param {ChainMethod} chainMethod 
     * @param { string[]} params 
     * @param {string} channelId 
     * @returns 
     * @memberof ChainService
     */
    invoke(chainMethod: ChainMethod, params: string[], channelId = 'mycc'): Promise<any> {
        return this.sendTransactionProposal(chainMethod, params, channelId)
            .then((results: ProposalResponseObject) => {
                Log.hlf.info(HlfInfo.CHECK_TRANSACTION_PROPOSAL);
                if (this.isProposalGood(results)) {
                    this.logSuccessfulProposalResponse(results);
                    let request: TransactionRequest = {
                        proposalResponses: results[0],
                        proposal: results[1],
                        header: results[2]
                    };
                    Log.hlf.info(HlfInfo.REGISTERING_TRANSACTION_EVENT);
                    let txPromise = this.registerTxEvent();
                    let eventPromises = [];
                    eventPromises.push(txPromise);
                    let sendPromise = this.channel.sendTransaction(request);
                    return this.concatEventPromises(sendPromise, eventPromises);
                } else {
                    return this.handleError(HlfErrors.FAILED_TO_SEND_PROPOSAL);
                }
            }).then((response) => {
                if (response.status === 'SUCCESS') {
                    Log.hlf.info(HlfInfo.SUCCESSSFULLY_SENT_TO_ORDERER);
                    return this.txId.getTransactionID();
                } else {
                    return this.handleError(response.status);
                }
            }).catch((err) => {
                return this.handleError(err);
            });
    }
}
