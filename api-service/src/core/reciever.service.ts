import { Injectable, Logger } from '@nestjs/common';

type HandlingMethod<T> = (data: T) => any;

@Injectable()
export class RecieverService {
  recieve<T, R>(command: string, data: T, handler: HandlingMethod<T>): R {
    // maybe we can log on debug only
    Logger.log(
      `${data ? JSON.stringify(data) : 'null'}`,
      `RECIEVING:${command}`,
    );
    return handler(data);
  }
}
