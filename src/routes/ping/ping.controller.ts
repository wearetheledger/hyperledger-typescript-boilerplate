import { ApiUseTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { PingService } from './ping.service';

@ApiUseTags('ping')
@Controller('')
export class PingController {

    /**
     * Creates an instance of PingController.
     * @param {PingService} pingService 
     * @memberof PingController
     */
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