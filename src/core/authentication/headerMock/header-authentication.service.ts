import { Injectable } from '@nestjs/common';
import { User } from 'fabric-client';
import { HlfCaClient } from '../../chain/hlfcaclient';
import { IAuthService } from '../interfaces/authenticationservice.interface';

@Injectable()
export class HeaderAuthenticationService implements IAuthService {

    /**
     * Creates an instance of Auth0Service.
     * @param {HlfCaClient} hlfCaClient
     * @memberof Auth0Service
     */
    constructor(private hlfCaClient: HlfCaClient) {

    }

    getUserId(userId: string): string {
        return userId || 'guest';
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
        return this.hlfCaClient.createUser(
            userId,
            'Org1MSP',
            'org1.department1',
            []
        );
    }
}
