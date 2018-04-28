import { Body, Controller, Get, Inject, Param, Post, Req } from '@nestjs/common';
import { CarService } from './car.service';
import { CarDto } from './car.model';
import { InvokeResult } from '../invokeresult.model';
import { ApiOAuth2Auth, ApiOperation, ApiResponse, ApiUseTags } from '@nestjs/swagger';
import { IAuthService } from '../../services/authentication/authenticationservice.interface';

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
        @Inject('IAuthService') private authService: IAuthService, // For some reason, we can't remove this line even tho it is not used
        private carService: CarService) {
    }

    /**
     * Get all cars
     *
     * @returns {Promise<CarDto[]>}
     * @memberof CarController
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
     * @param id
     */
    @Get(':id')
    @ApiOperation({title: 'Get a car by id'})
    @ApiOAuth2Auth(['read'])
    getById(@Param('id') id): Promise<CarDto> {
        return this.carService.getById(id);
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
    @ApiResponse({
        status: 201,
        description: 'The record has been successfully created.',
    })
    @ApiOAuth2Auth(['write'])
    create(@Body() carDto: CarDto, @Req() req): Promise<InvokeResult> {
        return this.carService.create(carDto, req.auth);
    }

}