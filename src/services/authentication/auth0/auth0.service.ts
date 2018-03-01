
import { Component, InternalServerErrorException } from '@nestjs/common';
import * as jwtDecode from 'jwt-decode';
import { JwtToken } from 'auth0';
import { UserAttr } from '../../chain/models/userattr.model';
import { HlfCaClient } from '../../chain/hlfcaclient';
import { Auth0UserModel } from './auth0user.model';

@Component()
export class Auth0Service {

    constructor(private hlfCaClient: HlfCaClient) {

    }

    enrollUser(auth0UserModel: Auth0UserModel): void {
        this.hlfCaClient.createUser(
            auth0UserModel.id,
            'Org1MSP',
            'org1.department1',
            this.transformAttrs(auth0UserModel)
        ).then(user => {
            console.log(user);
        });
    }

    getUserId(auth): Promise<string> {
        let auth0UserModel;
        if (auth) {
            let token: JwtToken = jwtDecode(auth.split(' ')[1]);
            const userId = token.replace('|', '-');
            // TODO: call Auth0api to fetch metadata
            auth0UserModel = {
                id: userId,
                username: userId,
                email: null,
                user_metadata: {}
            };
        } else {
            auth0UserModel = {
                id: 'guest',
                username: 'guest',
                email: null,
                user_metadata: {
                    role: 'guest'
                }
            };
        }
        return this.hlfCaClient.getUserFromStore(auth0UserModel.id)
            .then(storeUser => {
                if (storeUser) {
                    return Promise.resolve(auth0UserModel.id);
                } else {
                    return this.hlfCaClient.createUser(auth0UserModel.id, 'Org1MSP', 'org1.department1', this.transformAttrs(auth0UserModel));
                }
            })
            .then(newUser => {
                return Promise.resolve(auth0UserModel.id);
            })
            .catch(error => {
                throw new InternalServerErrorException('Unable to create user certificates for: ' + auth0UserModel.id);
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
