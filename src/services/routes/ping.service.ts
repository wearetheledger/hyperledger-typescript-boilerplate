import { Component } from '@nestjs/common';

@Component()
export class PingService {

    ping() {
        return 'Chain-service is alive!';
    }
}
