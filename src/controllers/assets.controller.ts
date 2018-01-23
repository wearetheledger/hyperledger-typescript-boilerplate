import { Observable } from 'rxjs';
import { AssetsService } from './../services/routes/assets.service';
import { Controller, Get, Param, Post } from '@nestjs/common';

@Controller('assets')
export class AssetsController {

    constructor(private assetsService: AssetsService) { }

    @Get()
    getAll( @Param() params: {}): Observable<number[]> {
        return this.assetsService.getAll();
    }

    @Post()
    create() {
        // TODO: Add some logic here
    }

}