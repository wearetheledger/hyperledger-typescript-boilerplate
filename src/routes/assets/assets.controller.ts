
import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetDto } from './asset.model';

@Controller('assets')
export class AssetsController {

    constructor(
        private assetsService: AssetsService) { }

    /**
     * Returns all stored assets
     * 
     * @param {{}} params 
     * @returns {Promise<AssetDto[]>} 
     * @memberof AssetsController
     */
    @Get()
    getAll( @Param() params: {}): Promise<AssetDto[]> {
        return this.assetsService.getAll();
    }

    /**
     * Creates new Asset
     * 
     * @param {AssetDto} assetDto 
     * @returns {Promise<InvokeResult>} 
     * @memberof AssetsController
     */
    @Post()
    create( @Body() assetDto: AssetDto): any {
        return this.assetsService.create(assetDto);
    }

}