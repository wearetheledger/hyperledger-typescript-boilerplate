import { Module, Global } from '@nestjs/common';
import { WebsocketService } from './websocket.service';
import { BroadCasterService } from './broadcaster.service';
import { RecieverService } from './reciever.service';

@Global()
@Module({
  providers: [WebsocketService, BroadCasterService, RecieverService],
  exports: [WebsocketService, BroadCasterService, RecieverService],
})
export class CoreModule {}
