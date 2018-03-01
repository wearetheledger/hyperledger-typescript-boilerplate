import { Log } from './../../logging/log.service';
import { EnvConfig } from './../../../config/env';
import { Component, InternalServerErrorException } from '@nestjs/common';
import * as jwtDecode from 'jwt-decode';
import { JwtToken, AuthenticationClient } from 'auth0';
import { UserAttr } from '../../chain/models/userattr.model';
import { HlfCaClient } from '../../chain/hlfcaclient';
import { Auth0UserModel } from './auth0user.model';
import { IAuthService } from '../authentication.interface';

@Component()
export class Auth0Service implements IAuthService {

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
            } else {
                this.auth0AccessToken = response.access_token;
                Log.config.info(`Generated Auth0 Access token:`, response.access_token);
            }
        });
    }

    getCredsUserId(auth): string {
        if (auth) {
            let token: JwtToken = jwtDecode(auth.split(' ')[1]);
            return token.sub.replace('|', '-');
        } else {
            return 'guest';
        }
    }

    getAuthUserId(auth): string {
        if (auth) {
            let token: JwtToken = jwtDecode(auth.split(' ')[1]);
            return token.sub;
        } else {
            return 'guest';
        }
    }

    getUserFromStore(userId: string): Promise<any> {
        return this.hlfCaClient.getUserFromStore(userId);
    }

    createUserCreds(userId: string): Promise<any> {
        return this.getUserModel(userId)
            .then((auth0UserModel: Auth0UserModel) => {
                return this.hlfCaClient.createUser(
                    auth0UserModel.id,
                    'Org1MSP',
                    'org1.department1',
                    this.transformAttrs(auth0UserModel)
                );
            });
    }

    private transformAttrs(auth0UserModel: Auth0UserModel): UserAttr[] {
        const object = {
            id: auth0UserModel.id,
            username: auth0UserModel.username,
            email: auth0UserModel.email,
            ...auth0UserModel.user_metadata,
        };
        return Object
            .keys(object)
            .map(key => { return { name: key, value: object[key], ecert: true }; });
    }

    private getUserModel(userId: string): Promise<Auth0UserModel> {
        if (userId != 'guest') {
            return this.getUserInfoFromAuth0(userId);
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
    }

    private getUserInfoFromAuth0(userId: string): Promise<Auth0UserModel> {
        return this.auth0Client.users
            .getInfo(this.auth0AccessToken, (err, userInfo: Auth0UserModel) => {
                if (err) {
                    Log.config.error(`Unable to fetch User data from Auth0`, userId);
                    throw new InternalServerErrorException(err);
                }
                return userInfo;
            });
    }



}
