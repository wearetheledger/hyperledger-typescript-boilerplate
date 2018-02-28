import { Component } from '@nestjs/common';

@Component()
export class Auth0Service {

    getUserData(userObject): void {
        console.log(userObject);


        return userObject;
    }
}
