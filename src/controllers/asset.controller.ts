import { Controller, Get, Param } from '@nestjs/common';

@Controller('')
export class AssetController {

    @Get()
    ping( @Param() params: {}): string {
        return 'Chain-service is alive!';
    }
}