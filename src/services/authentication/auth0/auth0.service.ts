import { Log } from './../../logging/log.service';
import { EnvConfig } from './../../../config/env';
import { Component, InternalServerErrorException } from '@nestjs/common';
import * as jwtDecode from 'jwt-decode';
import { JwtToken, AuthenticationClient } from 'auth0';
import { UserAttr } from '../../chain/models/userattr.model';
import { HlfCaClient } from '../../chain/hlfcaclient';
import { Auth0UserModel } from './auth0user.model';

@Component()
export class Auth0Service {

    private auth0Client;
    private auth0AccessToken: string;

    /**
     * Creates an instance of Auth0Service.
     * @param {HlfCaClient} hlfCaClient 
     * @memberof Auth0Service
     */
    constructor(private hlfCaClient: HlfCaClient) {
        // init a new Auth0 authenticationclient using env variables
        this.auth0Client = new AuthenticationClient({
            domain: EnvConfig.AUTH0_DOMAIN,
            clientId: EnvConfig.AUTH0_CLIENT_ID,
            clientSecret: EnvConfig.AUTH0_CLIENT_SECRET
        });
        // generate a JWT access token for auth0
        this.auth0Client.clientCredentialsGrant({
            audience: EnvConfig.AUTH0_AUDIENCE,
            scope: 'read:users update:users'
        }, (err, response) => {
            if (err) {
                Log.config.error(`Failed to generate Auth0 Access token:`, JSON.stringify(err));
            }else{
                this.auth0AccessToken = response.access_token;
                Log.config.info(`Generated Auth0 Access token:`, response.access_token);
            }
        });
    }

    /**
     * get user by authentication token
     * fetch user information from Auth0 using the pregenerated API access token
     * if user creds don't exist, generate user creds containing Auth0 metadata
     * 
     * @param {any} auth 
     * @returns {Promise<string>} 
     * @memberof Auth0Service
     */
    getUserId(auth): Promise<string> {
        let auth0UserModel;
        return Promise.resolve()
            .then((): Promise<Auth0UserModel> => {
                if (auth) {
                    let token: JwtToken = jwtDecode(auth.split(' ')[1]);
                    const userId = token.sub.replace('|', '-');
                    return this.auth0Client.users
                        .getInfo(this.auth0AccessToken, (err, userInfo: Auth0UserModel) => {
                            if (err) {
                                Log.config.error(`Unable to fetch User data from Auth0`, userId);
                                throw new InternalServerErrorException(err);
                            }
                            return {
                                id: userInfo.id,
                                username: userInfo.username,
                                email: userInfo.email,
                                user_metadata: userInfo.user_metadata
                            };
                        });
                } else {
                    return Promise.resolve({
                        id: 'guest',
                        username: 'guest',
                        email: null,
                        user_metadata: {
                            role: 'guest'
                        }
                    });
                }
            })
            .then((resolvedAuth0UserModel: Auth0UserModel) => {
                auth0UserModel = resolvedAuth0UserModel;
                return this.hlfCaClient.getUserFromStore(resolvedAuth0UserModel.id);
            })
            .then(storeUser => {
                if (storeUser) {
                    return Promise.resolve(auth0UserModel.id);
                } else {
                    return this.hlfCaClient.createUser(
                        auth0UserModel.id,
                        'Org1MSP',
                        'org1.department1',
                        this.transformAttrs(auth0UserModel)
                    );
                }
            })
            .then(newUser => {
                return Promise.resolve(auth0UserModel.id);
            })
            .catch(error => {
                throw new InternalServerErrorException('Failed to create user certificates for: ' + auth0UserModel.id);
            });
    }

    /**
     * transform Auth0 metadata object to creds UserAttr
     * 
     * @private
     * @param {Auth0UserModel} auth0UserModel 
     * @returns {UserAttr[]} 
     * @memberof Auth0Service
     */
    private transformAttrs(auth0UserModel: Auth0UserModel): UserAttr[] {

        const object = {
            id: auth0UserModel.id,
            username: auth0UserModel.username,
            email: auth0UserModel.email,
            ...auth0UserModel.user_metadata,
        };

        return Object.keys(object)
            .map(key => {
                return {
                    name: key,
                    value: object[key],
                    ecert: true
                };
            });
    }

}
