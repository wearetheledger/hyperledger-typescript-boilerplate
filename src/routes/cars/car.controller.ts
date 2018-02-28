import { Controller, Get, Post, Body, Headers } from '@nestjs/common';
import { CarService } from './car.service';
import { CarDto } from './car.model';
import { InvokeResult } from '../invokeresult.model';
import * as jwtDecode from 'jwt-decode';
import { JwtToken } from 'auth0';
import { ApiUseTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiUseTags('cars')
@Controller('cars')
export class CarController {

    /**
     * Creates an instance of CarController.
     * @memberof CarController
     * @param {CarService} carService
     */
    constructor(private carService: CarService) { }

    getUserId(auth) {
        if (auth) {
            const token: JwtToken = jwtDecode(auth.split(' ')[1]);
            return token.sub.split('|')[1];
        } else {
            return 'dummyUserID';
        }
    }

    /**
     * Get all cars
     *
     * @returns {Promise<CarDto[]>}
     * @memberof CarController
     * @param auth
     */
    @Get()
    getAll(@Headers('authorization') auth): Promise<CarDto[]> {
        return this.carService.getAll(this.getUserId(auth));
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
        return this.carService.create(carDto, this.getUserId(auth));
    }

}