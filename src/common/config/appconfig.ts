import { EnvConfig } from './env';
import * as path from 'path';
import { ConfigOptions } from './config.model';
import { PusherService } from '../../services/events/implementations/pusher.service';
import { Auth0AuthenticationService } from '../../modules/auth/auth0/auth0-authentication.service';

export const Appconfig: ConfigOptions = <ConfigOptions>{
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
            MspID: 'Org1MSP'
        },
        tlsOptions: {
            trustedRoots: [],
            verify: false
        },
        caName: 'ca.example.com'
    },
    auth: {
        credsMiddleware: {
            [`https://${EnvConfig.AUTH0_DOMAIN}/`]: 'Auth0AuthenticationService',
            [`${EnvConfig.DOMAIN_URL}/civic`]: 'CivicAuthenticationService',
        }
    },
    allowguest: true
};

export const EventService = {provide: 'IEventService', useClass: PusherService};
