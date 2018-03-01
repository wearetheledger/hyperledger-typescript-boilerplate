import { Log } from './../services/logging/log.service';
import { Auth0Service } from './../services/authentication/auth0/auth0.service';
import { Middleware, NestMiddleware, ExpressMiddleware } from '@nestjs/common';

@Middleware()
export class HlfCaMiddleware implements NestMiddleware {

    /**
     * Creates an instance of HlfCaMiddleware.
     * 
     * This middleware automatically creates HLF permission files based on the selected authentication provider
     * In this case we Are using the Auth0Service
     *
     * @param {Auth0Service} authService 
     * @memberof HlfCaMiddleware
     */
    constructor(private authService: Auth0Service) { }

    resolve(...args: any[]): ExpressMiddleware {
        return (req, res, next) => {
            const token = req.headers['authorization'];
            const userId = this.authService.getAuthUserId(token);

            this.authService.getUserFromStore(userId).then(userFromStore => {
                Log.config.debug('User From store:', userFromStore);
                // create user creds if not already exists
                if (!userFromStore) {
                    Log.config.debug('Creating new user:', userId);
                    this.authService.createUserCreds(userId).then(userCreds => {
                        next();
                    });
                } else {
                    next();
                }
            });
        };
    }
}