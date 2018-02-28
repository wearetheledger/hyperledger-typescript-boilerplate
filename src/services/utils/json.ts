import { Log } from './../logging/log.service';

export class Json {

    public static serializeJson = (obj: Object): string | boolean => {
        try {
            return JSON.stringify(obj);
        } catch (error) {
            Log.config.error(`JSON stringify error for object: ${obj}`);
            return false;
        }
    }
    public static deserializeJson = (string: string): Object | boolean => {
        try {
            return JSON.parse(string);
        } catch (error) {
            Log.config.error(`JSON parse error for string: ${string}`);
            return false;
        }
    }

    public static stringifyParams = (params: any[]): string[] | boolean => {
        try {
            return params.map(param => {
                if (typeof param === 'object' || Array.isArray(param)) {
                    return JSON.stringify(param);
                } else {
                    return param.toString();
                }
            });
        } catch (error) {
            Log.config.error(`stringifyParams error for params: ${params}`);
            return false;
        }

    }
}