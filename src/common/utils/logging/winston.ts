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
      
    static getLogger = (label: string) => {
         return createLogger({
            transports: [new transports.Console({
                level: 'debug',
              
            })],
            format: format.combine(
                format.colorize(),
                format.splat(),
                format.simple(),
                format.label({label: label})
            ),
            exitOnError: false,
        });
    }  
  
    public static hlf: Logger = Loggers.getLogger('FABRIC');
    public static grpc: Logger = Loggers.getLogger('GRPC');
    public static pusher: Logger = Loggers.getLogger('PUSHER');
    public static config: Logger = Loggers.getLogger('CONFIG');
    public static awssqs: Logger = Loggers.getLogger('SQS');
}
