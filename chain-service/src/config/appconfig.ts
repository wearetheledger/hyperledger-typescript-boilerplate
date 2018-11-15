import {EnvConfig} from './env';
import * as path from 'path';
import {ConfigOptions} from '../models/config.model';

export const Appconfig: ConfigOptions = {
    hlf: {
        walletPath: path.resolve(__dirname, `creds`),
        userId: 'admin',
        channelId: 'mychannel',
        chaincodeId: 'fabcar',
        networkUrl: `grpc://${EnvConfig.PEER_HOST}:7051`,
        eventUrl: `grpc://${EnvConfig.PEER_HOST}:7053`,
        ordererUrl: `grpc://${EnvConfig.ORDERER_HOST}:7050`,
        caUrl: `http://${EnvConfig.CA_HOST}:7054`,
        admin: {
            enrollmentID: 'admin',
            enrollmentSecret: 'adminpw',
            MspID: 'Org1MSP',
        },
        tlsOptions: {
            trustedRoots: [],
            verify: false,
        },
        caName: 'ca.example.com',
    }
} as ConfigOptions;

