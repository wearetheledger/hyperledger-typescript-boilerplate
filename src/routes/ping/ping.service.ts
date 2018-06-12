import { Injectable } from '@nestjs/common';

@Injectable()
export class PingService {

    /**
     * check if app is alive
     *
     * @returns {string}
     * @memberof PingService
     */
    ping(): string {
        return 'Chain service api is up and running. (<a href="/api">Open Swagger</a>)';
    }
}
