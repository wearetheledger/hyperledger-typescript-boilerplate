import { Module, Global } from '@nestjs/common';
import { BroadCasterService } from './broadcaster.service';
import { RecieverService } from './reciever.service';

@Global()
@Module({
  providers: [BroadCasterService, RecieverService],
  exports: [BroadCasterService, RecieverService],
})
export class CoreModule {}
