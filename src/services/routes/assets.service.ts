import { AssetDto } from './../../models/routes/asset.model';
import { InvokeResult } from './../../models/invokeresult.model';
import { ChainMethod } from './chainmethods.enum';
import { Component, InternalServerErrorException } from '@nestjs/common';
import { RequestHelper } from 'hlf-node-utils';

@Component()
export class AssetsService {

    constructor(private requestHelper: RequestHelper) { }

    /**
     * Get all assets
     * 
     * @returns {Promise<AssetDto[]>} 
     * @memberof AssetsService
     */
    getAll(): Promise<AssetDto[]> {
        return this.requestHelper.queryRequest([], ChainMethod.getAllAssets)
            .then(result => {
                return result;
            })
            .catch(error => {
                throw new InternalServerErrorException();
            });
    }

    /**
     * Create new asset
     * 
     * @param {AssetDto} assetDto 
     * @returns {Promise<InvokeResult>} 
     * @memberof AssetsService
     */
    create(assetDto: AssetDto): any {
        // push transaction onto awssqs here
    }
}
