import { Controller, Get, Post, Body, Headers } from '@nestjs/common';
import { CarService } from './car.service';
import { CarDto } from './car.model';
import { InvokeResult } from '../invokeresult.model';
import { ApiUseTags, ApiBearerAuth } from '@nestjs/swagger';
import { Auth0CredsService } from '../../services/authentication/auth0/auth0.credsservice';

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
        private authService: Auth0CredsService
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
        const userId = this.authService.getUserId(auth);
        return this.carService.getAll(userId);
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
        const userId = this.authService.getUserId(auth);
        return this.carService.create(carDto, userId);
    }

}