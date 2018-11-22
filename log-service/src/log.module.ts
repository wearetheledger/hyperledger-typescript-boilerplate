import { Module } from '@nestjs/common';
import { LogService } from './log.service';
import { CoreModule } from './core/core.module';
import { LogController } from './log.controller';

@Module({
  imports: [CoreModule],
  controllers: [LogController],
  providers: [LogService],
  exports: [],
})
export class LogModule {}
