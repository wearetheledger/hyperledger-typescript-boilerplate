import { Loggers } from './winston';
import { LoggerInstance } from 'winston';

export class Log {
    public static hlf: LoggerInstance = Loggers.hlf;
    public static grpc: LoggerInstance = Loggers.grpc;
    public static pusher: LoggerInstance = Loggers.pusher;
    public static awssqs: LoggerInstance = Loggers.awssqs;
    public static config: LoggerInstance = Loggers.config;

}