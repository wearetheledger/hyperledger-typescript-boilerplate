import { PingService } from './../services/routes/ping.service';
import { Controller, Get, Param } from '@nestjs/common';

@Controller('')
export class PingController {

    constructor(private pingService: PingService) { }

    @Get()
    ping( @Param() params: {}): string {
        return this.pingService.ping();
    }
}