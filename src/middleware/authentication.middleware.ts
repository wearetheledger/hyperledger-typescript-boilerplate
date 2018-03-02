
import { Middleware, NestMiddleware, ExpressMiddleware } from '@nestjs/common';
import * as jwt from 'express-jwt';
import { expressJwtSecret } from 'jwks-rsa';
import { EnvConfig } from '../config/env';

@Middleware()
export class AuthenticationMiddleware implements NestMiddleware {

    /**     
     * Performs authentication for selected routes (check the appmodule MiddlewaresConsumer to configure routes)
     * 
     * @param {Auth0Authenticator} auth0Authenticator 
     * @memberof AuthenticationMiddleware
     */
    resolve(): ExpressMiddleware {
        return jwt({
            secret: expressJwtSecret({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: `https://${EnvConfig.AUTH0_DOMAIN}.well-known/jwks.json`
            }),
            audience: EnvConfig.AUTH0_CLIENT_ID,
            issuer: `${EnvConfig.AUTH0_DOMAIN}`,
            algorithm: 'RS256'
        });
    }
}