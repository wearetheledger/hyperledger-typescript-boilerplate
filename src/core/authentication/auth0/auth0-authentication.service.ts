import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as jwtDecode from 'jwt-decode';
import { JwtToken, ManagementClient } from 'auth0';
import { UserAttr } from '../../chain/models/userattr.model';
import { HlfCaClient } from '../../chain/hlfcaclient';
import { Auth0UserModel } from './auth0user.model';
import { IAuthService } from '../interfaces/authenticationservice.interface';
import { User } from 'fabric-client';
import { EnvConfig } from '../../../common/config/env';
import { Log } from '../../../common/utils/logging/log.service';
import { flatten } from 'flat';

@Injectable()
export class Auth0AuthenticationService implements IAuthService {

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

    /**
     * get user id from auth token to be used in creds
     *
     * @param {string} bearerToken
     * @returns {string}
     * @memberof Auth0AuthenticationService
     */
    getUserId(bearerToken: string): string {
        if (bearerToken) {
            let token: JwtToken = jwtDecode(bearerToken.split(' ')[1]);
            return token.sub.replace('|', '_');
        }

        return null;
    }

    /**
     * check if user exists in store,
     * return user from creds
     *
     * @param {string} userId
     * @returns {Promise<User>}
     * @memberof Auth0AuthenticationService
     */
    getUserFromStore(userId: string): Promise<User> {
        return this.hlfCaClient.getUserFromStore(userId);
    }

    /**
     * Create new user credential file in store
     *
     * @param {string} userId
     * @returns {Promise<User>}
     * @memberof Auth0AuthenticationService
     */
    createUserCreds(userId: string): Promise<User> {
        return this.getUserModel(userId)
            .then((auth0UserModel: Auth0UserModel) => {
                return this.hlfCaClient.createUser(
                    userId,
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
     * @memberof Auth0AuthenticationService
     */
    private transformAttrs(auth0UserModel: Auth0UserModel): UserAttr[] {
        const object = flatten({
            auth0: {
                name: auth0UserModel.name,
                user_id: auth0UserModel.user_id,
                email: auth0UserModel.email,
                app_metadata: auth0UserModel.app_metadata,
                user_metadata: auth0UserModel.user_metadata,
            }
        });

        return Object
            .keys(object)
            .map(name => {

                let value = object[name];

                if (typeof object[name] !== 'string') {
                    value = JSON.stringify(value);
                }

                return {name, value, ecert: true};
            });

    }

    /**
     * Get user model from auth0
     * return mock object if guest
     *
     * @private
     * @param {string} userId
     * @returns {Promise<Auth0UserModel>}
     * @memberof Auth0AuthenticationService
     */
    private getUserModel(userId: string): Promise<Auth0UserModel> {
        if (userId != 'guest') {
            return this.getUserInfoFromAuth0(userId);
        } else {
            return Promise.resolve({
                user_id: 'guest',
                nickname: 'guest',
                email: null,
                app_metadata: {
                    role: 'guest'
                }
            } as Auth0UserModel);
        }
    }

    /**
     * api call to auth0 to fetch user info by id
     *
     * @private
     * @param {string} userId
     * @returns {Promise<Auth0UserModel>}
     * @memberof Auth0AuthenticationService
     */
    private getUserInfoFromAuth0(userId: string): Promise<Auth0UserModel> {
        return this.auth0Client.getUser({id: userId.replace('_', '|')})
            .catch(err => {
                Log.config.error(`Unable to fetch User data from Auth0`, userId);
                throw new InternalServerErrorException(err);
            });
    }

}
