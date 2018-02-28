import { Component } from '@nestjs/common';

@Component()
export class Auth0Service {

    createNewUser(userObject): void {
        console.log(userObject);
    }
}
