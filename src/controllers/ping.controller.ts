import { PingService } from './../services/routes/ping.service';
import { Controller, Get, Param } from '@nestjs/common';
import { Observable } from 'rxjs';

@Controller('')
export class PingController {

    constructor(private pingService: PingService) { }

    @Get()
    ping( @Param() params: {}): Observable<string> {
        return this.pingService.ping();
    }
}