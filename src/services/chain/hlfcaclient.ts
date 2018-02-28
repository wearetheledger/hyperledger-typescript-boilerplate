import { Log } from './../logging/log.service';
import { Component } from '@nestjs/common';
import { ChainService } from './chain.service';
const CaClient = require('fabric-ca-client');

@Component()
export class HlfCaClient {

    public caClient;
    public adminUser;

    constructor(private chainService: ChainService) { }

    init() {
        // const cryptoSuite = this.chainService.client.getCryptoSuite();
        const tlsOptions = {
            trustedRoots: [],
            verify: false
        };
        // be sure to change the http to https when the CA is running TLS enabled
        const cryptoSuite = this.chainService.client.getCryptoSuite();
        this.caClient = new CaClient('http://localhost:7054', tlsOptions, 'ca.example.com', cryptoSuite);

    }

    createAdmin() {
        return this.chainService.client.getUserContext('admin', true)
            .then((userFromStore) => {
                if (userFromStore && userFromStore.isEnrolled()) {
                    Log.hlf.info('Successfully loaded admin from persistence');
                    this.adminUser = userFromStore;
                    return null;
                } else {
                    // need to enroll it with CA server
                    return this.caClient.enroll({
                        enrollmentID: 'admin',
                        enrollmentSecret: 'adminpw'
                    }).then((enrollment) => {
                        Log.hlf.info('Successfully enrolled admin user "admin"');
                        return this.chainService.client.createUser({
                            username: 'admin',
                            mspid: 'Org1MSP',
                            cryptoContent: { privateKeyPEM: enrollment.key.toBytes(), signedCertPEM: enrollment.certificate }
                        });
                    }).then((user) => {
                        this.adminUser = user;
                        return this.chainService.client.setUserContext(this.adminUser);
                    }).catch((err) => {
                        Log.hlf.error('Failed to enroll and persist admin. Error: ' + err.stack ? err.stack : err);
                        throw new Error('Failed to enroll admin');
                    });
                }
            }).then(() => {
                Log.hlf.info('Assigned the admin user to the fabric client ::' + this.adminUser.toString());
            }).catch((err) => {
                Log.hlf.error('Failed to enroll admin: ' + err);
            });
    }


}
