import { InvokeResult } from './../services/routes/invokeresult.model';
import { AssetDto } from './../models/asset.model';

import { AssetsService } from './../services/routes/assets.service';
import { Controller, Get, Param, Post, Body } from '@nestjs/common';

@Controller('assets')
export class AssetsController {

    constructor(
        private assetsService: AssetsService) { }

    @Get()
    getAll( @Param() params: {}): Promise<AssetDto[]> {
        return this.assetsService.getAll();
    }

    @Post()
    create( @Body() assetDto: AssetDto): Promise<InvokeResult> {
        return this.assetsService.create(assetDto);
    }

}