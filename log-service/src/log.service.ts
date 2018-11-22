import { Injectable } from '../node_modules/@nestjs/common';
import { LogMessage } from './models/log.model';
import { Logger } from '@nestjs/common';

@Injectable()
export class LogService {
  create(log: LogMessage) {
    // handle using winston or some 3rd party service...
    Logger.log(log.message, log.service);
  }
}
