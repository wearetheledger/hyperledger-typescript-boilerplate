export interface IEventService {

    triggerSuccess(channel: string, eventName: string, data: any): void;

    triggerError(channel: string, eventName: string, data: any): void;

    triggerCustom(channel: string, eventName: string, data: any): void;
}
