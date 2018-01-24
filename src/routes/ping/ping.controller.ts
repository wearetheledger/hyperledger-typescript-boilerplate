import { Controller, Get } from '@nestjs/common';
import { PingService } from './ping.service';

@Controller('')
export class PingController {

    constructor(private pingService: PingService) { }

    /**
     * This is the root path of the api
     * Will indicate whether the service is loaded
     * 
     * @param {{}} params 
     * @returns {string} 
     * @memberof PingController
     */
    @Get()
    ping(): string {
        return this.pingService.ping();
    }
}