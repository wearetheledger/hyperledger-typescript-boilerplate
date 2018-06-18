import { Module } from '@nestjs/common';
import { EventService } from '../../common/config/appconfig';

@Module({
    providers: [EventService],
    exports: [EventService]
})
export class EventsModule {
}