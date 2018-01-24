import { WebSocketService } from './../services/socket/websocket.service';
import { Module } from '@nestjs/common';

@Module({
  components: [WebSocketService],
  exports: [WebSocketService]
})
export class EventsModule { }