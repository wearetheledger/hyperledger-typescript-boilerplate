import { EnvConfig } from './../../../config/env';
import { Component, InternalServerErrorException } from '@nestjs/common';
import * as jwtDecode from 'jwt-decode';
import { JwtToken } from 'auth0';
import { UserAttr } from '../../chain/models/userattr.model';
import { HlfCaClient } from '../../chain/hlfcaclient';
import { Auth0UserModel } from './auth0user.model';

@Component()
export class Auth0Service {

    constructor(private hlfCaClient: HlfCaClient) { }

    getUserId(auth): Promise<string> {
        let auth0UserModel;
        return Promise.resolve()
            .then((): Promise<Auth0UserModel> => {
                if (auth) {
                    let token: JwtToken = jwtDecode(auth.split(' ')[1]);
                    const userId = token.sub.replace('|', '-');
                    // TODO: call Auth0api to fetch metadata
                    // https://tld-greencard.eu.auth0.com/api/v2/users/id
                    return Promise.resolve({
                        id: userId,
                        username:userId,
                        email: null,
                        user_metadata: {}
                    })
                } else {
                    return Promise.resolve({
                        id: 'guest',
                        username: 'guest',
                        email: null,
                        user_metadata: {
                            role: 'guest'
                        }
                    })
                }
            })
            .then((resolvedAuth0UserModel: Auth0UserModel) => {
                auth0UserModel = resolvedAuth0UserModel;
                return this.hlfCaClient.getUserFromStore(resolvedAuth0UserModel.id)
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
