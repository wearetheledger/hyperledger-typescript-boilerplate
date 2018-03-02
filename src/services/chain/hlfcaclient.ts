import { EnvConfig } from './../../config/env';
import { UserAttr } from './models/userattr.model';
import { Log } from './../logging/log.service';
import { Component } from '@nestjs/common';
import { HlfErrors, HlfInfo } from './logging.enum';
import { HlfConfig } from './hlfconfig';

const CaClient = require('fabric-ca-client');

@Component()
export class HlfCaClient {

    // TODO: improve typings

    constructor(public hlfConfig: HlfConfig) { }

    init(adminId: string, adminPw: string, mspid: string): Promise<any> {
        if (!this.hlfConfig.caClient) {
            // const cryptoSuite = this.chainService.client.getCryptoSuite();
            const tlsOptions = {
                trustedRoots: [],
                verify: false
            };
            // be sure to change the http to https when the CA is running TLS enabled
            const cryptoSuite = this.hlfConfig.client.getCryptoSuite();
            this.hlfConfig.caClient = new CaClient(`http://${EnvConfig.CA_HOST}:7054`, tlsOptions, 'ca.example.com', cryptoSuite);
        }
        // create admin
        return this.createAdmin(adminId, adminPw, mspid);
    }

    createAdmin(enrollmentID: string, enrollmentSecret: string, mspid: string): Promise<any> {
        return this.getUserFromStore('admin').then(userFromStore => {
            if (userFromStore) {
                this.hlfConfig.adminUser = userFromStore;
                return this.hlfConfig.client.setUserContext(this.hlfConfig.adminUser);
            } else {
                return this.enrollUser(enrollmentID, enrollmentSecret, mspid)
                    .then((user) => {
                        this.hlfConfig.adminUser = user;
                        return this.hlfConfig.client.setUserContext(this.hlfConfig.adminUser);
                    }).catch((err) => {
                        Log.hlf.error(HlfErrors.FAILED_TO_ENROLL_ADMIN, err);
                        return Promise.reject(err);
                    });
            }
        }).then(() => {
            Log.hlf.info(HlfInfo.ASSIGNED_ADMIN, this.hlfConfig.adminUser.toString());
            return Promise.resolve(this.hlfConfig.adminUser);
        }).catch((err) => {
            Log.hlf.error(HlfErrors.FAILED_TO_ENROLL_ADMIN, err);
            return Promise.reject(err);
        });
    }

    createUser(username: string, mspid: string, affiliation: string, attrs: UserAttr[]): Promise<any> {
        Log.config.debug(`Creating user:`, username, mspid, affiliation, attrs);
        if (this.hlfConfig.adminUser) {
            return this.hlfConfig.caClient.register({
                role: 'client', // since hlf 1.1
                attrs: attrs, // since hlf 1.1
                enrollmentID: username,
                affiliation: affiliation
            }, this.hlfConfig.adminUser).then((secret) => {
                // next we need to enroll the user with CA server
                Log.hlf.info(HlfInfo.USER_REGISTERED, username);
                return this.enrollUser(username, secret, mspid);
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

    getUserFromStore(userId: string, checkPersistence = true): Promise<User> {
        return this.hlfConfig.client.getUserContext(userId, checkPersistence).then(userFromStore => {
            if (userFromStore && userFromStore.isEnrolled()) {
                return Promise.resolve(userFromStore);
            } else {
                return Promise.resolve(null);
            }
        });
    }

    enrollUser(enrollmentID: string, enrollmentSecret: string, mspid: string): Promise<any> {
        return this.hlfConfig.caClient.enroll({
            enrollmentID: enrollmentID,
            enrollmentSecret: enrollmentSecret
        }).then((enrollment) => {
            Log.hlf.info(HlfInfo.USER_ENROLLED, enrollmentID);
            return this.hlfConfig.client.createUser({
                username: enrollmentID,
                mspid: mspid,
                cryptoContent: {
                    privateKeyPEM: enrollment.key.toBytes(),
                    signedCertPEM: enrollment.certificate
                }
            });
        }).catch(error => {
            return Promise.reject(error);
        });
    }

}
