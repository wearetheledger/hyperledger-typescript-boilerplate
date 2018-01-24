
import { Component, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import * as Yup from 'yup';
import { ChainMethod } from '../chainmethods.enum';
import { AssetDto } from './asset.model';
import { InvokeResult } from '../invokeresult.model';
import { RequestHelper } from '../../services/chain/requesthelper';
import { QueuePusherService } from '../../services/queue/queuepusher.service';

@Component()
export class AssetsService {

    /**
     * Creates an instance of AssetsService.
     * @param {RequestHelper} requestHelper 
     * @param {QueuePusherService} queuePusherService 
     * @memberof AssetsService
     */
    constructor(
        private requestHelper: RequestHelper,
        private queuePusherService: QueuePusherService) { }

    /**
     * Get all assets
     * 
     * @returns {Promise<AssetDto[]>} 
     * @memberof AssetsService
     */
    getAll(): Promise<AssetDto[]> {
        return this.requestHelper.queryRequest(ChainMethod.getAllAssets, [])
            .then(result => {
                return result;
            })
            .catch(error => {
                throw new InternalServerErrorException(`Query Failed`);
            });
    }

    /**
     * Create new asset
     * 
     * @param {AssetDto} assetDto 
     * @returns {Promise<InvokeResult>} 
     * @memberof AssetsService
     */
    create(assetDto: AssetDto): Promise<InvokeResult> {
        // this is an invoke, push transaction onto awssqs here
        // TODO: authentication check and userid
        const userId = 'bob';
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            description: Yup.string().required()
        });

        return this.requestHelper.validateRequest(schema, assetDto)
            .then(params => {
                return this.queuePusherService.add(ChainMethod.createNewAsset, [params], userId)
                    .then(result => {
                        return result;
                    })
                    .catch(error => {
                        throw new InternalServerErrorException(`Failed to add to AWS queue`);
                    });
            })
            .catch(error => {
                throw new BadRequestException(`Invalid DTO`);
            });

    }
}
