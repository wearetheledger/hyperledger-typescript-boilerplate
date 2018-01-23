import { ChainMethod } from './chainmethods.enum';
import { AssetDto } from './../../models/asset.model';
import { Component, InternalServerErrorException } from '@nestjs/common';
import { RequestHelper } from 'hlf-node-utils';
import { InvokeResult } from './invokeresult.model';

@Component()
export class AssetsService {

    constructor(private requestHelper: RequestHelper) { }

    getAll(): Promise<AssetDto[]> {
        return this.requestHelper.queryRequest([], ChainMethod.getAllAssets)
            .then(result => {
                return result;
            })
            .catch(error => {
                throw new InternalServerErrorException();
            });
    }

    create(assetDto: AssetDto): Promise<InvokeResult> {
        return this.requestHelper.invokeRequest([], ChainMethod.createNewAsset)
            .then(result => {
                return result;
            })
            .catch(error => {
                throw new InternalServerErrorException();
            });
    }
}
