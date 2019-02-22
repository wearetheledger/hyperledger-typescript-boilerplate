import 'dotenv/config';

export interface ProcessEnv {
    [key: string]: string | undefined;
}

/**
 * node EnvConfig variables,
 * copy .env.example file, rename to .env
 *
 * @export
 * @class EnvConfig
 */
export class EnvConfig {

    // NODE
    public static NODE_ENV = process.env['NODE_ENV'] || 'LOCAL';
    public static PORT = process.env['PORT'] || 3000;
    public static DOMAIN_URL = process.env['DOMAIN_URL'] || '';

    // AWS
    public static AWS_ACCESS_KEY = process.env['AWS_ACCESS_KEY'] || '';
    public static AWS_SECRET_ACCESS_KEY = process.env['AWS_SECRET_ACCESS_KEY'] || '';
    public static AWS_REGION = process.env['AWS_REGION'] || '';

    // FABRIC
    public static PEER_HOST = process.env['PEER_HOST'] || 'localhost';
    public static ORDERER_HOST = process.env['ORDERER_HOST'] || 'localhost';
    public static CA_HOST = process.env['CA_HOST'] || 'localhost';

    // PUSHER
    public static PUSHER_KEY = process.env['PUSHER_KEY'];
    public static PUSHER_APP_ID = process.env['PUSHER_APP_ID'];
    public static PUSHER_SECRET = process.env['PUSHER_SECRET'];
    public static PUSHER_CLUSTER = process.env['PUSHER_CLUSTER'];

    // Auth0
    public static AUTH0_CLIENT_ID = process.env['AUTH0_CLIENT_ID'];
    public static AUTH0_CLIENT_SECRET = process.env['AUTH0_CLIENT_SECRET'];
    public static AUTH0_DOMAIN = process.env['AUTH0_DOMAIN'];
    public static AUTH0_AUDIENCE = process.env['AUTH0_AUDIENCE'];

    // Logger
    public static LOGGER_SQS_DEBUG = process.env['LOGGER_SQS_DEBUG'] || false;
    public static SKIP_MIDDLEWARE = process.env['SKIP_MIDDLEWARE'] || false;

}