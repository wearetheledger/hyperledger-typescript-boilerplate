
import { Controller, Get, Post, Body, Headers } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetDto } from './asset.model';
import { InvokeResult } from '../invokeresult.model';

@Controller('assets')
export class AssetsController {

    /**
     * Creates an instance of AssetsController.
     * @param {AssetsService} assetsService 
     * @memberof AssetsController
     */
    constructor(
        private assetsService: AssetsService) { }

    /**
     * Get all assets
     * 
     * @param {{}} params 
     * @param {string} [headerParams] 
     * @returns {Promise<AssetDto[]>} 
     * @memberof AssetsController
     */
    @Get()
    getAll( @Headers() headerParams: string): Promise<AssetDto[]> {
        return this.assetsService.getAll(headerParams[`access_token`]);
    }

    /**
     * Create new asset
     * 
     * @param {AssetDto} assetDto 
     * @param {string} [headerParams] 
     * @returns {*} 
     * @memberof AssetsController
     */
    @Post()
    create( @Body() assetDto: AssetDto, @Headers() headerParams: string): Promise<InvokeResult> {
        return this.assetsService.create(assetDto, headerParams[`access_token`]);
    }

}