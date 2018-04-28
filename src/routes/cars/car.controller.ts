import { Body, Controller, Get, Headers, Inject, Post, Req } from '@nestjs/common';
import { CarService } from './car.service';
import { CarDto } from './car.model';
import { InvokeResult } from '../invokeresult.model';
import {
    ApiBearerAuth,
    ApiImplicitHeader,
    ApiOAuth2Auth,
    ApiOperation,
    ApiResponse,
    ApiUseTags
} from '@nestjs/swagger';
import { IAuthService } from '../../services/authentication/authenticationservice.interface';

@ApiBearerAuth()
@ApiUseTags('cars')
@Controller('cars')
export class CarController {

    /**
     * Creates an instance of CarController.
     * @memberof CarController
     * @param {CarService} carService
     * @param authService
     */
    constructor(
        private carService: CarService,
        @Inject('IAuthService') private authService: IAuthService) {
    }

    /**
     * Get all cars
     *
     * @returns {Promise<CarDto[]>}
     * @memberof CarController
     * @param auth
     */
    @Get()
    @ApiOperation({title: 'Get all cars'})
    @ApiOAuth2Auth(['read'])
    getAll(): Promise<CarDto[]> {
        return this.carService.getAll();
    }

    /**
     * Get car by id
     *
     * @returns {Promise<CarDto[]>}
     * @memberof CarController
     * @param req
     */
    @Get(':id')
    @ApiOperation({title: 'Get a car by id'})
    @ApiOAuth2Auth(['read'])
    getById(@Req() req): Promise<CarDto[]> {
        //const userId = this.authService.getUserId(auth);
        return this.carService.getAll();
    }

    /**
     * Create new car
     *
     * @param {CarDto} carDto
     * @param req
     * @returns {*}
     * @memberof CarController
     */
    @Post()
    @ApiOperation({title: 'Create new car'})
    @ApiImplicitHeader({name: 'authorization', required: false})
    @ApiResponse({
        status: 201,
        description: 'The record has been successfully created.',
    })
    @ApiOAuth2Auth(['write'])
    create(@Body() carDto: CarDto, @Req() req): Promise<InvokeResult> {
        return this.carService.create(carDto, req.auth);
    }

}