import { HlfErrors, HlfInfo } from './logging.enum';
import { Component } from '@nestjs/common';
import { ChainService } from './chain.service';
import { ChainMethod } from '../../routes/chainmethods.enum';
import { Log } from '../logging/log.service';
import { FabricOptions } from './fabricoptions.model';

const fabricClient = require('fabric-client');

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
        console.log('Store path:' + this.options.walletPath);
        this.client = new fabricClient();

        return fabricClient.newDefaultKeyValueStore({
            path: this.options.walletPath
        })
            .then((wallet: IKeyValueStore) => {
                console.log(wallet);
                // assign the store to the fabric client
                this.client.setStateStore(wallet);
                let cryptoSuite = fabricClient.newCryptoSuite();
                // use the same location for the state store (where the users' certificate are kept)
                // and the crypto store (where the users' keys are kept)
                let cryptoStore = fabricClient.newCryptoKeyStore({path: this.options.walletPath});
                cryptoSuite.setCryptoKeyStore(cryptoStore);
                this.client.setCryptoSuite(cryptoSuite);

                return this.client.getUserContext(this.options.userId, true);
            })
            .then((user: User) => {
                if (user && user.isEnrolled()) {
                    this.client.setUserContext(user);
                    this.channel = this.client.newChannel(this.options.channelId);
                    const peerObj = this.client.newPeer(this.options.networkUrl);
                    this.channel.addPeer(peerObj);
                    this.channel.addOrderer(this.client.newOrderer(this.options.ordererUrl));
                    this.targets.push(peerObj);
                    Log.hlf.info(HlfInfo.INIT_SUCCESS);
                } else {
                    return Promise.reject(HlfErrors.NO_ENROLLED_USER);
                }
            })
            .catch((err) => {
                console.log(err);
                return Promise.reject(err);
            });
    }

    /**
     * Query hlf
     *
     * @param {ChainMethod} chainMethod
     * @param {string[]} params
     * @param {string} [chaincodeId='mycc']
     * @returns {Promise<any>}
     * @memberof HlfClient
     */
    query(chainMethod: ChainMethod, params: string[], chaincodeId = this.options.chaincodeId): Promise<any> {
        Log.hlf.info(chainMethod, params);
        return this.newQuery(chainMethod, params, chaincodeId)
            .then((queryResponses: Buffer[]) => {
                return Promise.resolve(this.getQueryResponse(queryResponses));
            })
            .catch((err) => {
                console.log(err);
                return Promise.reject(err);
            });
    }

    /**
     * invoke
     *
     * @param {ChainMethod} chainMethod
     * @param { string[]} params
     * @param {string} chaincodeId
     * @returns
     * @memberof ChainService
     */
    invoke(chainMethod: ChainMethod, params: string[], chaincodeId = this.options.chaincodeId): Promise<any> {
        Log.hlf.info(chainMethod, params);
        return this.sendTransactionProposal(chainMethod, params, chaincodeId)
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
                    return Promise.resolve(this.concatEventPromises(sendPromise, eventPromises));
                } else {
                    return this.handleError(HlfErrors.FAILED_TO_SEND_PROPOSAL);
                }
            })
            .then((response) => {
                if (response.status === 'SUCCESS') {
                    Log.hlf.info(HlfInfo.SUCCESSSFULLY_SENT_TO_ORDERER);
                    return Promise.resolve(this.txId.getTransactionID());
                } else {
                    return this.handleError(response.status);
                }
            })
            .catch((err) => {
                return Promise.reject(err);
            });
    }
}
