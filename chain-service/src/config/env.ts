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
  // FABRIC
  public static PEER_HOST = process.env['PEER_HOST'] || 'localhost';
  public static ORDERER_HOST = process.env['ORDERER_HOST'] || 'localhost';
  public static CA_HOST = process.env['CA_HOST'] || 'localhost';
  public static REDIS_URL =
    process.env['REDIS_URL'] || 'redis://localhost:6379';
}
