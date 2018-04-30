import { Log } from '../../services/logging/log.service';
import {
    BadRequestException,
    ExpressMiddleware,
    InternalServerErrorException,
    Middleware,
    NestMiddleware,
    UnauthorizedException
} from '@nestjs/common';
import { Appconfig } from '../config/appconfig';
import { IAuthUser } from '../../modules/auth/authenticateduser';
import { Auth0AuthenticationService } from '../../modules/auth/auth0/auth0-authentication.service';
import { CivicAuthenticationService } from '../../modules/auth/civic/civic-authentication.service';
import * as jwtDecode from 'jwt-decode';
import { JwtToken } from 'auth0';
import { IAuthService } from '../../modules/auth/interfaces/IAuthService';

@Middleware()
export class HlfcredsgeneratorMiddleware implements NestMiddleware {
    private authService: IAuthService;

    /**
     * Creates an instance of HlfCaMiddleware.
     *
     * This middleware automatically creates HLF user certificates based on the selected authentication provider
     * In this case we Are using the Auth0Service.
     *
     * @memberof HlfCaMiddleware
     * @param Auth0AuthenticationService
     * @param CivicAuthenticationService
     */
    constructor(private Auth0AuthenticationService: Auth0AuthenticationService,
                private CivicAuthenticationService: CivicAuthenticationService) {
    }

    resolve(...args: any[]): ExpressMiddleware {
        return (req, res, next) => {
            const rawHeader = req.headers['authorization'];

            if (!rawHeader) {
                return next(new UnauthorizedException(`No authorization header present`));
            }

            let jwtObject: JwtToken = jwtDecode(rawHeader.split(' ')[1]);

            // This is pretty hacky
            // TODO: Refactor, maybe by using chained middleware?
            const authServiceClass = Appconfig.auth.credsMiddleware[jwtObject.iss];

            if (!authServiceClass) {
                return next(new BadRequestException(`No handler for issuer: ${jwtObject.iss}`));
            }

            this.authService = this[authServiceClass];

            let userId = this.authService.getUserId(jwtObject);

            if (!userId && !Appconfig.allowguest) {
                Log.config.debug('UserId not provided and allowguest is marked as false, not allowed to continue');
                throw new UnauthorizedException();
            } else if (!userId) {
                userId = 'guest';
            } else if (userId) {
                req.auth = <IAuthUser>{
                    id: userId
                };
            }

            this.authService.getUserFromStore(userId)
                .then(userFromStore => {
                    // create user creds if not already exists
                    if (!userFromStore) {
                        Log.config.debug('Creating new user:', userId);
                        // token.sub = unchanged user id from auth0
                        this.authService.createUserCreds(jwtObject)
                            .then(() => {
                                next();
                            })
                            .catch(err => {
                                next(new InternalServerErrorException(err));
                            });

                    } else {
                        Log.config.debug('User From store:', userFromStore.getName());

                        next();
                    }
                });
        };
    }
}