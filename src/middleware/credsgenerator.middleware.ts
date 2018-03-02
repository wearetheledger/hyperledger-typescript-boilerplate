import { Log } from './../services/logging/log.service';
import { Middleware, NestMiddleware, ExpressMiddleware, InternalServerErrorException } from '@nestjs/common';
import { Auth0CredsService } from '../services/authentication/auth0/auth0.credsservice';

@Middleware()
export class CredsGenerator implements NestMiddleware {

    /**
     * Creates an instance of HlfCaMiddleware.
     * 
     * This middleware automatically creates HLF permission files based on the selected authentication provider
     * In this case we Are using the Auth0Service.
     *
     * @param {Auth0Service} authService 
     * @memberof HlfCaMiddleware
     */
    constructor(private authCredsService: Auth0CredsService) { }

    resolve(...args: any[]): ExpressMiddleware {
        return (req, res, next) => {
            const token = req.headers['authorization'];
            const userId = this.authCredsService.getUserId(token);

            this.authCredsService.getUserFromStore(userId).then(userFromStore => {
                Log.config.debug('User From store:', userFromStore);
                // create user creds if not already exists
                if (!userFromStore) {
                    Log.config.debug('Creating new user:', userId);
                    // token.sub = unchanged user id from auth0
                    if (token) {
                        this.createUser(token.sub).then(() => { next() }).catch(err => {
                            throw new InternalServerErrorException(err);
                        });
                    } else {
                        this.createUser('guest').then(() => { next() }).catch(err => {
                            throw new InternalServerErrorException(err);
                        });
                    }
                } else {
                    next();
                }
            });
        };
    }

    private createUser(userId: string) {
        return this.authCredsService.createUserCreds(userId).then(userCreds => {
            return userCreds;
        }).catch(err => {
            return err;
        });
    }
}