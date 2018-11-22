import { Injectable, Logger } from '@nestjs/common';
import { BroadCasterService } from './core/broadcaster.service';
import { LogMessage } from './core/models/log.model';

@Injectable()
export class ApiService {
  constructor(private broadcasterService: BroadCasterService) {
    setInterval(() => {
      this.broadcasterService
        .broadcast<LogMessage, void>(`LOG`, {
          message: 'test',
          type: 'debug',
        })
        .subscribe();
    }, 1000);
  }
}
