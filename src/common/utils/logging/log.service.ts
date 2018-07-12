import { Loggers } from './winston';
import { Logger } from 'winston';

export class Log {
    public static hlf: Logger = Loggers.hlf;
    public static grpc: Logger = Loggers.grpc;
    public static pusher: Logger = Loggers.pusher;
    public static awssqs: Logger = Loggers.awssqs;
    public static config: Logger = Loggers.config;

}