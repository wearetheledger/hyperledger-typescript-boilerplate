import { HlfInfo } from './logging.enum';
import { Injectable } from '@nestjs/common';
import { ChainService } from './chain.service';
import { ChainMethod } from '../../routes/chainmethods.enum';
import { Log } from '../logging/log.service';
import { HlfConfig } from './hlfconfig';
import { HlfConfigOptions } from '../../common/config/config.model';
import { IKeyValueStore, ProposalResponseObject, TransactionRequest } from 'fabric-client';
import FabricClient = require('fabric-client');

@Injectable()
export class HlfClient extends ChainService {

    constructor(public hlfConfig: HlfConfig) {
        super(hlfConfig);
    }

    /**
     * init
     * @returns {Promise<any>}
     * @memberof ChainService
     */
    init(config: HlfConfigOptions): Promise<any> {

        this.hlfConfig.options = config;
        this.hlfConfig.client = new FabricClient();

        return FabricClient
            .newDefaultKeyValueStore({
                path: this.hlfConfig.options.walletPath
            })
            .then((wallet: IKeyValueStore) => {
                console.log(wallet);
                // assign the store to the fabric client
                this.hlfConfig.client.setStateStore(wallet);
                let cryptoSuite = FabricClient.newCryptoSuite();
                // use the same location for the state store (where the users' certificate are kept)
                // and the crypto store (where the users' keys are kept)
                let cryptoStore = FabricClient.newCryptoKeyStore({path: this.hlfConfig.options.walletPath});
                cryptoSuite.setCryptoKeyStore(cryptoStore);
                this.hlfConfig.client.setCryptoSuite(cryptoSuite);

                this.hlfConfig.channel = this.hlfConfig.client.newChannel(this.hlfConfig.options.channelId);
                const peerObj = this.hlfConfig.client.newPeer(this.hlfConfig.options.networkUrl);

                this.hlfConfig.channel.addPeer(peerObj);
                this.hlfConfig.channel.addOrderer(this.hlfConfig.client.newOrderer(this.hlfConfig.options.ordererUrl));
                this.hlfConfig.targets.push(peerObj);

                Log.hlf.info(HlfInfo.INIT_SUCCESS);
            });
    }

    /**
     * Query hlf
     *
     * @param {ChainMethod} chainMethod
     * @param {string[]} params
     * @param transientMap
     * @returns {Promise<any>}
     * @memberof HlfClient
     */
    query(chainMethod: ChainMethod, params: string[], transientMap?: Object): Promise<any> {
        Log.hlf.info(HlfInfo.MAKE_QUERY, chainMethod, params);
        return this.newQuery(chainMethod, params, this.hlfConfig.options.chaincodeId, transientMap)
            .then((queryResponses: Buffer[]) => {
                return Promise.resolve(this.getQueryResponse(queryResponses));
            });
    }

    /**
     * invoke
     *
     * @param {ChainMethod} chainMethod
     * @param { string[]} params
     * @param transientMap
     * @returns
     * @memberof ChainService
     */
    invoke(chainMethod: ChainMethod, params: string[], transientMap?: Object): Promise<any> {
        Log.hlf.info(chainMethod, params);
        return this.sendTransactionProposal(chainMethod, params, this.hlfConfig.options.chaincodeId, transientMap)
            .then((result: { txHash: string; buffer: ProposalResponseObject }) => {
                // Log.hlf.debug(JSON.stringify(result.buffer));
                Log.hlf.info(HlfInfo.CHECK_TRANSACTION_PROPOSAL);
                if (this.isProposalGood(result.buffer)) {
                    this.logSuccessfulProposalResponse(result.buffer);

                    let request: TransactionRequest = {
                        proposalResponses: result.buffer[0],
                        proposal: result.buffer[1]
                    };
                    Log.hlf.info(HlfInfo.REGISTERING_TRANSACTION_EVENT);


                    let sendPromise = this.hlfConfig.channel.sendTransaction(request);
                    let txPromise = this.registerTxEvent(result.txHash);

                    return Promise.all([sendPromise, txPromise]);
                } else {

                    let message = (<any>result.buffer[0][0]).message;

                    if ((<any>result.buffer[0][0]).message.indexOf(' transaction returned with failure: ') !== -1) {
                        message = (<any>result.buffer[0][0]).message.split(' transaction returned with failure: ')[1];

                        try {
                            message = JSON.parse(message);
                        } catch (e) {
                        }
                    }
                    return Promise.reject(message);
                }
            })
            .then((results) => {
                if (!results || (results && results[0] && results[0].status !== 'SUCCESS')) {
                    Log.hlf.error('Failed to order the transaction. Error code: ' + results[0].status);
                }

                if (!results || (results && results[1] && results[1].event_status !== 'VALID')) {
                    Log.hlf.error('Transaction failed to be committed to the ledger due to ::' + results[1].event_status);
                }
            });
    }
}
