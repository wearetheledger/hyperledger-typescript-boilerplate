import { Module } from '@nestjs/common';
import { EventService } from '../common/config/appconfig';

@Module({
    components: [EventService],
    exports: [EventService]
})
export class EventsModule {
}