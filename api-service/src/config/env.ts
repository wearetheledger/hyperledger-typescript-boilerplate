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
  public static REDIS_URL =
    process.env['REDIS_URL'] || 'redis://localhost:6379';
  public static SERVICE_ID = process.env['SERVICE_ID'] || 'api-service';
}
