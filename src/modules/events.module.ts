import { Module } from '@nestjs/common';
import { WebSocketService } from '../services/events/websocket.service';

@Module({
  components: [WebSocketService],
  exports: [WebSocketService]
})
export class EventsModule { }