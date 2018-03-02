import { Log } from './../../logging/log.service';
import { EnvConfig } from './../../../config/env';
import { Component, InternalServerErrorException } from '@nestjs/common';
import * as jwtDecode from 'jwt-decode';
import { JwtToken, ManagementClient } from 'auth0';
import { UserAttr } from '../../chain/models/userattr.model';
import { HlfCaClient } from '../../chain/hlfcaclient';
import { Auth0UserModel } from './auth0user.model';
import { IAuthService } from '../authentication.interface';

@Component()
export class Auth0CredsService implements IAuthService {

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
            scope: 'read:users write:users',
            audience: EnvConfig.AUTH0_AUDIENCE,
            tokenProvider: {
                enableCache: true,
                cacheTTLInSeconds: 10
            }
        });
    }

    /**
     * get user id from auth token to be used in creds
     * 
     * @param {any} auth 
     * @returns {string} 
     * @memberof Auth0CredsService
     */
    getUserId(auth): string {
        if (auth) {
            let token: JwtToken = jwtDecode(auth.split(' ')[1]);
            return token.sub.replace('|', '-');
        } else {
            return 'guest';
        }
    }

    /**
     * check if user exists in store, 
     * return user from creds
     * 
     * @param {string} userId 
     * @returns {Promise<any>} 
     * @memberof Auth0CredsService
     */
    getUserFromStore(userId: string): Promise<User> {
        return this.hlfCaClient.getUserFromStore(userId);
    }

    /**
     * Create new user credendtial files in store
     * 
     * @param {string} userId 
     * @returns {Promise<any>} 
     * @memberof Auth0CredsService
     */
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

    /**
     * Transform user attributes from auth0
     * 
     * @private
     * @param {Auth0UserModel} auth0UserModel 
     * @returns {UserAttr[]} 
     * @memberof Auth0CredsService
     */
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

    /**
     * Get user model from auth0
     * return mock object if guest
     * 
     * @private
     * @param {string} userId 
     * @returns {Promise<Auth0UserModel>} 
     * @memberof Auth0CredsService
     */
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

    /**
     * api call to auth0 to fetch user info by id
     * 
     * @private
     * @param {string} userId 
     * @returns {Promise<Auth0UserModel>} 
     * @memberof Auth0CredsService
     */
    private getUserInfoFromAuth0(userId: string): Promise<Auth0UserModel> {
        return this.auth0Client.getUser(userId, (err, userInfo) => {
            if (err) {
                Log.config.error(`Unable to fetch User data from Auth0`, userId);
                throw new InternalServerErrorException(err);
            }
            return userInfo;
        });
    }

}
