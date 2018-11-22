import { Injectable } from '../node_modules/@nestjs/common';
import { Logger } from '@nestjs/common';
import { LogMessage } from './core/models/log.model';

@Injectable()
export class LogService {
  create(log: LogMessage) {
    // handle using winston or some 3rd party service...
    Logger.log(log.message, log.type);
  }
}
