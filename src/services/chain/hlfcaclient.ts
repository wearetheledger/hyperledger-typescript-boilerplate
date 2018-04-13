import { UserAttr } from './models/userattr.model';
import { Log } from '../logging/log.service';
import { Component } from '@nestjs/common';
import { HlfErrors, HlfInfo } from './logging.enum';
import { HlfConfig } from './hlfconfig';
import { AdminCreds } from '../../config/config.model';

const CaClient = require('fabric-ca-client');

@Component()
export class HlfCaClient {

    // TODO: improve typings

    constructor(public hlfConfig: HlfConfig) {
    }

    init(adminCreds: AdminCreds): Promise<void | User> {
        if (!this.hlfConfig.caClient) {
            // const cryptoSuite = this.chainService.client.getCryptoSuite();
            // be sure to change the http to https when the CA is running TLS enabled
            const cryptoSuite = this.hlfConfig.client.getCryptoSuite();

            this.hlfConfig.caClient = new CaClient(
                this.hlfConfig.options.caUrl,
                this.hlfConfig.options.tlsOptions,
                this.hlfConfig.options.caName, cryptoSuite);
        }
        // create admin
        return this.createAdmin(adminCreds.enrollmentID, adminCreds.enrollmentSecret, adminCreds.MspID);
    }

    createAdmin(enrollmentID: string, enrollmentSecret: string, mspid: string): Promise<User> {
        return this.getUserFromStore(this.hlfConfig.options.admin.enrollmentID).then(userFromStore => {
            if (userFromStore) {
                this.hlfConfig.adminUser = userFromStore;
                return this.hlfConfig.client.setUserContext(this.hlfConfig.adminUser);
            } else {
                return this.enrollUser(enrollmentID, enrollmentSecret, mspid)
                    .then((user: User) => {
                        this.hlfConfig.adminUser = user;
                        return this.hlfConfig.client.setUserContext(this.hlfConfig.adminUser);
                    });
            }
        }).then(() => {
            Log.hlf.info(HlfInfo.ASSIGNED_ADMIN, this.hlfConfig.adminUser.toString());
            return Promise.resolve(this.hlfConfig.adminUser);
        });
    }

    createUser(username: string, mspid: string, affiliation: string, attrs: UserAttr[]): Promise<User> {
        Log.config.debug(`Creating user:`, username, mspid, affiliation, attrs);
        if (this.hlfConfig.adminUser) {
            return this.hlfConfig.caClient.register({
                role: 'client', // since hlf 1.1
                attrs: attrs, // since hlf 1.1
                enrollmentID: username,
                affiliation: affiliation
            }, this.hlfConfig.adminUser)
                .then((secret) => {
                    // next we need to enroll the user with CA server
                    Log.hlf.info(HlfInfo.USER_REGISTERED, username);
                    return this.enrollUser(username, secret, mspid);
                })
                .catch((err) => {
                    Log.hlf.error(HlfErrors.FAILED_TO_REGISTER, username);
                    if (err.toString().indexOf('Authorization') > -1) {
                        Log.hlf.error(HlfErrors.AUTH_FAILURES);
                    }
                    throw err;
                });
        } else {
            return Promise.reject(HlfErrors.NO_ADMIN_USER);
        }
    }

    getUserFromStore(userId: string, checkPersistence = true): Promise<User | void> {
        return this.hlfConfig.client.getUserContext(userId, checkPersistence)
            .then(userFromStore => {
                if (userFromStore && userFromStore.isEnrolled()) {
                    return Promise.resolve(userFromStore);
                } else {
                    return Promise.resolve(null);
                }
            });
    }

    enrollUser(enrollmentID: string, enrollmentSecret: string, mspid: string): Promise<User> {
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
        });
    }

}
