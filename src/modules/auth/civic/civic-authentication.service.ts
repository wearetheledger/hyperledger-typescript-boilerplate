import { EnvConfig } from '../../../common/config/env';
import { Component } from '@nestjs/common';
import { JwtToken, ManagementClient } from 'auth0';
import { UserAttr } from '../../../services/chain/models/userattr.model';
import { HlfCaClient } from '../../../services/chain/hlfcaclient';
import { IAuthService } from '../interfaces/IAuthService';
import { CivicUserModel, CivicUserProperty } from './civicUser.model';
import * as jwt from 'jsonwebtoken';
import { ICivicJWT } from './ICivicJWT';

@Component()
export class CivicAuthenticationService implements IAuthService {

    private auth0Client;

    /**
     * Creates an instance of Auth0Service.
     * @param {HlfCaClient} hlfCaClient
     * @memberof Auth0Service
     */
    constructor(private hlfCaClient: HlfCaClient) {
        this.auth0Client = new ManagementClient({
            domain: EnvConfig.AUTH0_DOMAIN,
            clientId: EnvConfig.AUTH0_CLIENT_ID,
            clientSecret: EnvConfig.AUTH0_CLIENT_SECRET,
            scope: 'read:users read:users_app_metadata',
            audience: EnvConfig.AUTH0_AUDIENCE,
            tokenProvider: {
                enableCache: true,
                cacheTTLInSeconds: 10
            }
        });
    }

    createToken(userModel: CivicUserModel): { expires_in: number, access_token: string } {
        const expiresIn = 60 * 60;
        const user = {
            ...userModel.data.reduce((all, obj: CivicUserProperty) => ({
                ...all,
                [obj.label]: {
                    value: obj.value,
                    isOwner: obj.isOwner,
                    isValid: obj.isValid,
                }
            }), {})
        };
        const token = jwt.sign(user, '3a9d9e8ad0039b6f0c1776451e2852d0f203a218179fa74198310134bd192f21', {
            issuer: `${EnvConfig.DOMAIN_URL}/civic`,
            audience: EnvConfig.DOMAIN_URL,
            expiresIn: '2 days',
            subject: userModel.userId
        });

        return {
            expires_in: expiresIn,
            access_token: token,
        };
    }

    /**
     * get user id from auth token to be used in creds
     *
     * @returns {string}
     * @memberof CivicAuthenticationService
     * @param token
     */
    getUserId(token: JwtToken): string {
        if (token) {
            return token.sub;
        }

        return null;
    }

    /**
     * check if user exists in store,
     * return user from creds
     *
     * @param {string} userId
     * @returns {Promise<User>}
     * @memberof CivicAuthenticationService
     */
    getUserFromStore(userId: string): Promise<User> {
        return this.hlfCaClient.getUserFromStore(userId);
    }

    /**
     * Create new user credential file in store
     *
     * @returns {Promise<User>}
     * @memberof CivicAuthenticationService
     * @param tokenObject
     */
    createUserCreds(tokenObject: ICivicJWT): Promise<User> {
        return this.hlfCaClient.createUser(
            tokenObject.sub,
            'Org1MSP',
            'org1.department1',
            this.transformAttrs(tokenObject)
        );
    }

    /**
     * Transform user attributes from auth0
     *
     * @private
     * @returns {UserAttr[]}
     * @memberof CivicAuthenticationService
     * @param tokenObject
     */
    private transformAttrs(tokenObject: ICivicJWT): UserAttr[] {
        const object = {
            provider: 'civic',
            user_id: tokenObject.sub,
            email: tokenObject['contact.personal.email'].value,
            properties: JSON.stringify({
                ['contact.personal.email']: tokenObject['contact.personal.email'],
                ['contact.personal.phoneNumber']: tokenObject['contact.personal.phoneNumber'],
            })
        };
        return Object
            .keys(object)
            .map(key => {
                return {name: key, value: object[key], ecert: true};
            });

    }

}
