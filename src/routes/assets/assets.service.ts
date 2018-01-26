
import { Component, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import * as Yup from 'yup';
import { ChainMethod } from '../chainmethods.enum';
import { AssetDto } from './asset.model';
import { InvokeResult } from '../invokeresult.model';
import { RequestHelper } from '../../services/chain/requesthelper';

@Component()
export class AssetsService {

    /**
     * Creates an instance of AssetsService.
     * @param {RequestHelper} requestHelper 
     * @memberof AssetsService
     */
    constructor(
        private requestHelper: RequestHelper) { }

    /**
     * get all assets
     * 
     * @param {string} userId 
     * @returns {Promise<AssetDto[]>} 
     * @memberof AssetsService
     */
    getAll(userId: string): Promise<AssetDto[]> {
        // this is a query, query chaincode directly
        return this.requestHelper.queryRequest(ChainMethod.getAllAssets, [], userId)
            .then(result => {
                return result;
            })
            .catch(error => {
                throw new InternalServerErrorException(`Query Failed`);
            });
    }

    /**
     * create new asset
     * 
     * @param {AssetDto} assetDto 
     * @param {string} userId 
     * @returns {Promise<InvokeResult>} 
     * @memberof AssetsService
     */
    create(assetDto: AssetDto, userId: string): Promise<InvokeResult> {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            description: Yup.string().required()
        });

        // this is an invoke, push transaction onto awssqs here
        return this.requestHelper.validateRequest(schema, assetDto)
            .then(params => {
                return this.requestHelper.invokeRequest(ChainMethod.createNewAsset, [params], userId)
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
