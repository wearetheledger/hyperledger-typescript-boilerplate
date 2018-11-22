import { Module } from '@nestjs/common';
import { LogService } from './log.service';
import { CoreModule } from './core/core.module';

@Module({
  imports: [CoreModule],
  providers: [LogService],
  exports: [],
})
export class LogModule {}
