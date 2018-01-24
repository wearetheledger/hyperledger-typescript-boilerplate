import { Component } from '@nestjs/common';

@Component()
export class PingService {

    /**
     * check if app is alive
     * 
     * @returns {string} 
     * @memberof PingService
     */
    ping(): string {
        return 'Chain-service is alive!';
    }
}
