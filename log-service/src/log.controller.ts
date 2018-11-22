import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { LogMessage } from './models/log.model';
import { RecieverService } from './core/reciever.service';
import { LogService } from './log.service';

@Controller()
export class NewsController {
  constructor(
    private recieverService: RecieverService,
    private logService: LogService,
  ) {}

  // This is currently where we listen to the redis queue to message patterns from other services
  @MessagePattern({ cmd: `LOG` })
  incomingLog(logMessage: LogMessage) {
    this.recieverService.recieve<LogMessage, void>(
      'LOG',
      logMessage,
      this.logService.create.bind(logMessage),
    );
  }

}
