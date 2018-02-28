import { Auth0UserModel } from './../../routes/webhooks/models/auth0user.model';
import { HlfCaClient } from './../chain/hlfcaclient';
import { Component } from '@nestjs/common';
import { UserAttr } from '../chain/models/userattr.model';

@Component()
export class Auth0Service {


    constructor(private hlfCaClient: HlfCaClient) {

    }

    enrollUser(auth0UserModel: Auth0UserModel): void {
        this.hlfCaClient.createUser(
            auth0UserModel.username,
            'mspid',
            'org1.department',
            this.transformAttrs()
        ).then(user => {
            console.log(user);
        })
    }

    private transformAttrs(): UserAttr[] {
        return [];
    }
}
