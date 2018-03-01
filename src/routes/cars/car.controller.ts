import { Controller, Get, Post, Body, Headers } from '@nestjs/common';
import { CarService } from './car.service';
import { CarDto } from './car.model';
import { InvokeResult } from '../invokeresult.model';
import { ApiUseTags, ApiBearerAuth } from '@nestjs/swagger';
import { Auth0Service } from '../../services/authentication/auth0/auth0.service';

@ApiBearerAuth()
@ApiUseTags('cars')
@Controller('cars')
export class CarController {

    /**
     * Creates an instance of CarController.
     * @memberof CarController
     * @param {CarService} carService
     */
    constructor(
        private carService: CarService,
        private auth0Service: Auth0Service
    ) { }

    /**
     * Get all cars
     *
     * @returns {Promise<CarDto[]>}
     * @memberof CarController
     * @param auth
     */
    @Get()
    getAll(@Headers('authorization') auth): Promise<CarDto[]> {
        return this.auth0Service.getUserId(auth).then(userId => {
            return this.carService.getAll(userId);
        });
    }

    /**
     * Create new car
     * 
     * @param {CarDto} carDto 
     * @param auth
     * @returns {*} 
     * @memberof CarController
     */
    @Post()
    create(@Body() carDto: CarDto, @Headers('authorization') auth): Promise<InvokeResult> {
        return this.auth0Service.getUserId(auth).then(userId => {
            return this.carService.create(carDto, userId);
        });

    }

}