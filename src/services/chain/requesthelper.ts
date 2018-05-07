import { Component, Inject } from '@nestjs/common';
import { HlfClient } from './hlfclient';
import { QueuePusherService } from '../queue/queuepusher.service';
import { ChainMethod } from '../../routes/chainmethods.enum';
import { InvokeResult } from '../../routes/invokeresult.model';
import { EnvConfig } from '../../config/env';
import { PusherService } from '../events/implementations/pusher.service';
import { Log } from '../logging/log.service';
import { isObject } from '@nestjs/common/utils/shared.utils';
import { IEventService } from '../events/event.interface';

@Component()
export class RequestHelper {
  // TODO: refactor invokes according to https://docs.nestjs.com/recipes/cqrs

  /**
   * Creates an instance of RequestHelper.
   * @param {HlfClient} hlfClient
   * @param {PusherService} eventService
   * @param {QueuePusherService} queuePusherService
   * @memberof RequestHelper
   */
  constructor(
    private hlfClient: HlfClient,
    @Inject('IEventService') private eventService: IEventService,
    private queuePusherService: QueuePusherService,
  ) {}

  /**
   * Pass transaction request to aws queue
   *
   * @param {ChainMethod} chainMethod
   * @param {Object} params
   * @param {string} userId
   * @param invokeAlways - Workaround for message deduplication SQS
   * @returns {Promise<InvokeResult>}
   * @memberof RequestHelper
   */
  public invokeRequest(chainMethod: ChainMethod, params: Object, userId: string, invokeAlways = false): Promise<InvokeResult | any> {
    const arrayParams = this.convertObjectParams(params);

    if (EnvConfig.BYPASS_QUEUE) {
      return this.hlfClient
        .invoke(chainMethod, arrayParams)
        .then((response) => {
          Log.hlf.debug('Invoke successfully executed: ', response);
          this.eventService.triggerSuccess(userId, chainMethod, params);
          return { txHash: response };
        })
        .catch((error) => {
          Log.hlf.error(`${chainMethod}`, error);
          this.eventService.triggerError(userId, chainMethod, params);
          throw error;
        });
    } else {
      return this.queuePusherService
        .add(chainMethod, arrayParams, userId, invokeAlways)
        .then((response) => {
          Log.awssqs.debug('Invoke successfully added to SQS queue: ', response);
          return response;
        })
        .catch((error) => {
          Log.awssqs.error(`${chainMethod}`, error);
          throw error;
        });
    }
  }

  /**
   * Query hlf chain and return response
   *
   * @param {ChainMethod} chainMethod
   * @param {Object} params
   * @returns {Promise<any>}
   * @memberof RequestHelper
   */
  public queryRequest(chainMethod: ChainMethod, params: Object = {}): Promise<any> {
    const arrayParams = this.convertObjectParams(params);

    return this.hlfClient
      .query(chainMethod, arrayParams)
      .then((response) => {
        Log.hlf.debug('Query successfully executed!');
        return response;
      })
      .catch((error) => {
        Log.hlf.error(`${chainMethod}`, error);
        throw error;
      });
  }

  /**
   * Convert object to string array
   *
   * @private
   * @param {Object} paramsS
   * @returns {string[]}
   * @memberof RequestHelper
   */
  private convertObjectParams(params: Object): string[] {
    return Object.keys(params).map((key) => {
      if (isObject(params[key])) {
        return JSON.stringify(params[key]);
      }
      return params[key].toString();
    });
  }
}
