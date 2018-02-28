import { UserAttr } from './models/userattr.model';
import { Log } from './../logging/log.service';
import { Component } from '@nestjs/common';
import { ChainService } from './chain.service';
import { HlfErrors, HlfInfo } from './logging.enum';
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

    createAdmin(enrollmentID: string, enrollmentSecret: string, username: string, mspid: string): Promise<any> {
        return this.chainService.client.getUserContext('admin', true)
            .then((userFromStore) => {
                if (userFromStore && userFromStore.isEnrolled()) {
                    this.adminUser = userFromStore;
                    return Promise.resolve(this.adminUser);
                } else {
                    return this.caClient.enroll({
                        enrollmentID: enrollmentID,
                        enrollmentSecret: enrollmentSecret
                    }).then((enrollment) => {
                        Log.hlf.info(HlfInfo.USER_ENROLLED, this.adminUser);
                        return this.chainService.client.createUser({
                            username: username,
                            mspid: mspid,
                            cryptoContent: { privateKeyPEM: enrollment.key.toBytes(), signedCertPEM: enrollment.certificate }
                        });
                    }).then((user) => {
                        this.adminUser = user;
                        return this.chainService.client.setUserContext(this.adminUser);
                    }).catch((err) => {
                        Log.hlf.error(HlfErrors.FAILED_TO_ENROLL_ADMIN, err);
                        return Promise.reject(err);
                    });
                }
            }).then(() => {
                Log.hlf.info(HlfInfo.ASSIGNED_ADMIN, this.adminUser.toString());
                return Promise.resolve(this.adminUser);
            }).catch((err) => {
                Log.hlf.error(HlfErrors.FAILED_TO_ENROLL_ADMIN, err);
                return Promise.reject(err);
            });
    }

    createUser(username: string, mspid: string, affiliation: string, attrs: UserAttr[]): Promise<any> {
        if (this.adminUser) {
            return this.caClient.register({
                role: 'client', // since hlf 1.1
                attrs: attrs, // since hlf 1.1
                enrollmentID: username,
                affiliation: affiliation
            }, this.adminUser)
                .then((secret) => {
                    // next we need to enroll the user with CA server
                    Log.hlf.info(HlfInfo.USER_REGISTERED, username);
                    return this.caClient.enroll({ enrollmentID: username, enrollmentSecret: secret });
                }).then((enrollment) => {
                    Log.hlf.info(HlfInfo.USER_ENROLLED, username);
                    return this.chainService.client.createUser(
                        {
                            username: username,
                            mspid: mspid,
                            cryptoContent: { privateKeyPEM: enrollment.key.toBytes(), signedCertPEM: enrollment.certificate }
                        });
                }).then((user) => {
                    return Promise.resolve(user);
                }).catch((err) => {
                    Log.hlf.error(HlfErrors.FAILED_TO_REGISTER, username);
                    if (err.toString().indexOf('Authorization') > -1) {
                        Log.hlf.error(HlfErrors.AUTH_FAILURES);
                    }
                    return Promise.reject(err);
                });
        } else {
            return Promise.reject(HlfErrors.NO_ADMIN_USER);
        }
    }

}
