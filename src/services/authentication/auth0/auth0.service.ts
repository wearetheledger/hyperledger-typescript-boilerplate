
import { Component } from '@nestjs/common';
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

    getUserId(auth) {
        if (auth) {
            let token: JwtToken = jwtDecode(auth.split(' ')[1]);
            token = token.replace('|', '-');
            // check if user certificate exists
            // if ()
                return token;
        } else {
            return 'dummyUserID';
        }
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
