import { Injectable } from '@nestjs/common';
import { HlfClient } from './hlfclient';
import { ChainMethod } from '../../src/chainmethods.enum';
import { InvokeResult } from '../../src/common/utils/invokeresult.model';
import { EnvConfig } from '../../src/common/config/env';
import { Log } from '../../src/common/utils/logging/log.service';

@Injectable()
export class RequestHelper {
  constructor(private hlfClient: HlfClient) {}

  public invokeRequest(
    chainMethod: ChainMethod,
    params: Object,
    userId: string,
    invokeAlways = false,
    transientMap?: Object,
  ): Promise<InvokeResult | any> {
    const args = [JSON.stringify(params)];

    if (EnvConfig.BYPASS_QUEUE) {
      return this.hlfClient
        .invoke(chainMethod, args, transientMap)
        .then(response => {
          Log.hlf.debug('Invoke successfully executed: ', response);
          this.eventService.triggerSuccess(userId, chainMethod, params);
          return { txHash: response };
        })
        .catch(error => {
          Log.hlf.error(`${chainMethod}`, error);
          this.eventService.triggerError(userId, chainMethod, params);
          throw error;
        });
    } else {
      return this.queuePusherService
        .add(chainMethod, args, userId, invokeAlways)
        .then(response => {
          Log.awssqs.debug(
            'Invoke successfully added to SQS queue: ',
            response,
          );
          return response;
        })
        .catch(error => {
          Log.awssqs.error(`${chainMethod}`, error);
          throw error;
        });
    }
  }

  public queryRequest(
    chainMethod: ChainMethod,
    params: Object = {},
    transientMap?: Object,
  ): Promise<any> {
    const args = [JSON.stringify(params)];

    return this.hlfClient
      .query(chainMethod, args, transientMap)
      .then(response => {
        Log.hlf.debug('Query successfully executed!');
        return response;
      })
      .catch(error => {
        Log.hlf.error(`${chainMethod}`, error);
        throw error;
      });
  }
}
