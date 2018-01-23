import { Component } from '@nestjs/common';
import { Observable } from 'rxjs';

@Component()
export class PingService {

    ping() {
        return Observable.of('Chain-service is alive!');
    }
}
