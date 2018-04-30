import { ApiUseTags } from '@nestjs/swagger';
import { Body, Controller, InternalServerErrorException, Post } from '@nestjs/common';
import { CarDto } from '../../../routes/cars/car.model';
import * as civicSip from 'civic-sip-api';
import { CivicAuthenticationService } from './civic-authentication.service';
import { Log } from '../../../services/logging/log.service';

const civicClient = civicSip.newClient({
    appId: 'BJOXxDxpM',
    appSecret: 'fe2f9f775130976b5210897955039b1c',
    prvKey: '3a9d9e8ad0039b6f0c1776451e2852d0f203a218179fa74198310134bd192f21',
});

// private signing:
// 3a9d9e8ad0039b6f0c1776451e2852d0f203a218179fa74198310134bd192f21
// public signing:
// 045fa8d3585762c9dffc2e9635ecd1ab89ca15bcb78b7b3c4d2654a3a1ba8b663210d4f29c075d94ececc9f2a17e80f652db0fc78e45571e86a1edf3457d587cbe
// secret:
// fe2f9f775130976b5210897955039b1c
// private encryption:
// 196716115118dd5bd9d97a65080c83937de4e7e562c39917416d82a511a8143a
// public encryption:
// 4c5481a9773464b438154154826942149ae6b7e650c17e62d29bc6683ef937c7282e4db86e82a1de71522bd3e245f709f5d87c86c339afe9eea78521359981a1

@ApiUseTags('auth/civic')
@Controller('auth/civic')
export class CivicController {

    /**
     * Creates an instance of CivicController.
     * @memberof CivicController
     * @param civicService
     */
    constructor(private civicService: CivicAuthenticationService) {
    }

    /**
     * Exchange user data using a code
     *
     * @returns {Promise<CarDto[]>}
     * @memberof CivicController
     */
    @Post()
    ExchangeCode(@Body() body: { token: string }): Promise<any> {
        return civicClient.exchangeCode(body.token)
            .then(this.civicService.createToken)
            .catch((error) => {
                Log.hlf.error(error)
                throw new InternalServerErrorException(error);
            });
    }

}