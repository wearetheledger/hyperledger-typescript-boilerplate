import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { RecieverService } from './core/reciever.service';
import { LogService } from './log.service';
import { TransferModel } from './core/models/transfer.model';
import { LogMessage } from './core/models/log.model';

@Controller()
export class LogController {
  constructor(
    private recieverService: RecieverService,
    private logService: LogService,
  ) {}

  // This is currently where we listen to the redis queue to message patterns from other services
  @MessagePattern({ cmd: `LOG` })
  incomingLog(logMessage: TransferModel<LogMessage>) {
    this.recieverService.recieve<LogMessage, void>(
      logMessage.type,
      logMessage.data,
      this.logService.create.bind(logMessage),
    );
  }
}
