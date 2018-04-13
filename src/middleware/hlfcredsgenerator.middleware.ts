import { Log } from '../services/logging/log.service';
import { ExpressMiddleware, Inject, InternalServerErrorException, Middleware, NestMiddleware } from '@nestjs/common';
import { IAuthService } from '../services/authentication/authentication.interface';

@Middleware()
export class CredsGenerator implements NestMiddleware {

    /**
     * Creates an instance of HlfCaMiddleware.
     *
     * This middleware automatically creates HLF user certificates based on the selected authentication provider
     * In this case we Are using the Auth0Service.
     *
     * @memberof HlfCaMiddleware
     * @param authCredsService
     */
    constructor(@Inject('IAuthService') private authCredsService: IAuthService) {
    }

    resolve(...args: any[]): ExpressMiddleware {
        return (req, res, next) => {
            const token = req.headers['authorization'];
            const userId = this.authCredsService.getUserId(token);

            this.authCredsService.getUserFromStore(userId)
                .then(userFromStore => {
                    Log.config.debug('User From store:', userFromStore);
                    // create user creds if not already exists
                    if (!userFromStore) {
                        Log.config.debug('Creating new user:', userId);
                        // token.sub = unchanged user id from auth0
                        if (token) {
                            this.createUser(token.sub).then(() => {
                                next();
                            }).catch(err => {
                                throw new InternalServerErrorException(err);
                            });
                        } else {
                            this.createUser('guest').then(() => {
                                next();
                            }).catch(err => {
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
        return this.authCredsService.createUserCreds(userId)
            .then(userCreds => {
                return userCreds;
            }).catch(err => {
                return err;
            });
    }
}