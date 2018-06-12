import { Global, Module } from '@nestjs/common';
import { EventService } from '../common/config/appconfig';

@Global()
@Module({
    providers: [EventService],
    exports: [EventService]
})
export class EventsModule {
}