import { PingService } from './../services/routes/ping.service';
import { Controller, Get, Param } from '@nestjs/common';

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
    ping( @Param() params: {}): string {
        return this.pingService.ping();
    }
}