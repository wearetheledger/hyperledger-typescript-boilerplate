import { Injectable, Logger } from '@nestjs/common';

type HandlingMethod<T> = (data: T) => any;

@Injectable()
export class RecieverService {
  recieve<T, R>(command: string, data: T, handler: HandlingMethod<T>): R {
    // trigger some generic recieving handlers...
    return handler(data);
  }
}
