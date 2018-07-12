import { createLogger, format, Logger, transports } from 'winston';
import 'winston-daily-rotate-file';

// TODO should re-add logging persistance
/*
new transports.DailyRotateFile({
                level: 'info',
                filename: '/var/log/chain-service/chain-service.log',
                datePattern: 'yyyy-MM-dd.',
                prepend: true,
                json: false,
                
                maxFiles: 10
            })
 */

export class Loggers {

    public static hlf: Logger = createLogger({
        transports: [new transports.Console({
            level: 'debug',
            
        })],
        format: format.combine(
            format.colorize(),
            format.simple(),
            format.label({label: 'FABRIC'})
        ),
        exitOnError: false,
    });

    public static grpc: Logger = createLogger({
        transports: [new transports.Console({
            level: 'debug',
            
        })],
        format: format.combine(
            format.colorize(),
            format.simple(),
            format.label({label: 'GRPC'})
        ),
        exitOnError: false,
    });

    public static pusher: Logger = createLogger({
        transports: [new transports.Console({
            level: 'debug',
            
        })],
        format: format.combine(
            format.colorize(),
            format.simple(),
            format.label({label: 'PUSHER'})
        ),
        exitOnError: false,
    });

    public static config: Logger = createLogger({
        transports: [new transports.Console({
            level: 'debug',
            
        })],
        format: format.combine(
            format.colorize(),
            format.simple(),
            format.label({label: 'CONFIG'})
        ),
        exitOnError: false,
    });

    public static awssqs: Logger = createLogger({
        transports: [new transports.Console({
            level: 'debug',
            
        })],
        format: format.combine(
            format.colorize(),
            format.simple(),
            format.label({label: 'SQS'})
        ),
        exitOnError: false,
    });
}