import { HlfErrors, HlfInfo } from './logging.enum';
import { Component } from '@nestjs/common';
import { ChainService } from './chain.service';
import { ChainMethod } from '../../routes/chainmethods.enum';
import { Log } from '../logging/log.service';
import { FabricOptions } from './fabricoptions.model';
import fabricClient = require('fabric-client');
import { HlfConfig } from './hlfconfig';

@Component()
export class HlfClient extends ChainService {

    // TODO: refactor

    constructor(public hlfConfig: HlfConfig) {
        super(hlfConfig);
    }

    /**
     * set hlf options
     *
     * @param {FabricOptions} fabricoptions
     * @memberof HlfClient
     */
    setOptions(fabricoptions: FabricOptions) {
        this.hlfConfig.options = fabricoptions;
    }

    /**
     * init
     * @returns {Promise<any>}
     * @memberof ChainService
     */
    init(): Promise<any> {
        console.log('Store path:' + this.hlfConfig.options.walletPath);
        this.hlfConfig.client = new fabricClient();

        return fabricClient
            .newDefaultKeyValueStore({
                path: this.hlfConfig.options.walletPath
            })
            .then((wallet: IKeyValueStore) => {
                console.log(wallet);
                // assign the store to the fabric client
                this.hlfConfig.client.setStateStore(wallet);
                let cryptoSuite = fabricClient.newCryptoSuite();
                // use the same location for the state store (where the users' certificate are kept)
                // and the crypto store (where the users' keys are kept)
                let cryptoStore = fabricClient.newCryptoKeyStore({ path: this.hlfConfig.options.walletPath });
                cryptoSuite.setCryptoKeyStore(cryptoStore);
                this.hlfConfig.client.setCryptoSuite(cryptoSuite);

                this.hlfConfig.channel = this.hlfConfig.client.newChannel(this.hlfConfig.options.channelId);
                const peerObj = this.hlfConfig.client.newPeer(this.hlfConfig.options.networkUrl);
                this.hlfConfig.channel.addPeer(peerObj);
                this.hlfConfig.channel.addOrderer(this.hlfConfig.client.newOrderer(this.hlfConfig.options.ordererUrl));
                this.hlfConfig.targets.push(peerObj);
                Log.hlf.info(HlfInfo.INIT_SUCCESS);
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
    query(chainMethod: ChainMethod, params: string[], chaincodeId = this.hlfConfig.options.chaincodeId): Promise<any> {
        Log.hlf.info(HlfInfo.MAKE_QUERY, chainMethod, params);
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
    invoke(chainMethod: ChainMethod, params: string[], chaincodeId = this.hlfConfig.options.chaincodeId): Promise<any> {
        Log.hlf.info(HlfInfo.MAKE_INVOKE, chainMethod, params);
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
                    let sendPromise = this.hlfConfig.channel.sendTransaction(request);
                    return Promise.resolve(this.concatEventPromises(sendPromise, eventPromises));
                } else {
                    return this.handleError(results[0][0].message);
                }
            })
            .then((response) => {
                if (response.status === 'SUCCESS') {
                    Log.hlf.info(HlfInfo.SUCCESSSFULLY_SENT_TO_ORDERER);
                    return Promise.resolve(this.hlfConfig.txId.getTransactionID());
                } else {
                    return this.handleError(response.status);
                }
            })
            .catch((err) => {
                return Promise.reject(err);
            });
    }
}
