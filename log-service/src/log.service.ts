import { Injectable } from '../node_modules/@nestjs/common';
import { Logger } from '@nestjs/common';
import { LogMessage } from './core/models/log.model';
import { TransferModel } from './core/models/transfer.model';

@Injectable()
export class LogService {
  create(logMessage: LogMessage) {
    // handle using winston or some 3rd party service...

    Logger.log(logMessage.message, logMessage.type);
  }
}
