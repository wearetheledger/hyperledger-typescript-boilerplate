import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
// import { RequestHelper } from './requesthelper';
// import { HlfClient } from './hlfclient';
// import { HlfCaClient } from './hlfcaclient';
// import { HlfConfig } from './hlfconfig';

@Module({
  imports: [CoreModule],

  providers: [
    // RequestHelper,
    // HlfConfig,
    // HlfClient,
    // HlfCaClient
  ],
})
export class ChainModule {}
