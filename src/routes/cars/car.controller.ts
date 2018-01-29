
import { Controller, Get, Post, Body, Headers } from '@nestjs/common';
import { CarService } from './car.service';
import { CarDto } from './car.model';
import { InvokeResult } from '../invokeresult.model';

@Controller('cars')
export class CarController {

    /**
     * Creates an instance of CarController.
     * @param {CarService} CarService 
     * @memberof CarController
     */
    constructor(private carService: CarService) { }

    /**
     * Get all cars
     * 
     * @param {{}} params 
     * @param {string} [headerParams] 
     * @returns {Promise<CarDto[]>} 
     * @memberof CarController
     */
    @Get()
    getAll( @Headers() headerParams: string): Promise<CarDto[]> {
        return this.carService.getAll(headerParams[`access_token`]);
    }

    /**
     * Create new car
     * 
     * @param {CarDto} carDto 
     * @param {string} [headerParams] 
     * @returns {*} 
     * @memberof CarController
     */
    @Post()
    create( @Body() carDto: CarDto, @Headers() headerParams: string): Promise<InvokeResult> {
        return this.carService.create(carDto, headerParams[`access_token`]);
    }

}