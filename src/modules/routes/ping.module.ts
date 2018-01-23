import { PingController } from './../../controllers/ping.controller';
import { PingService } from './../../services/routes/ping.service';
import { Module } from '@nestjs/common';

@Module({
    controllers: [
        PingController
    ],
    components: [
        PingService
    ],
    modules: [],
})
export class PingModule { }