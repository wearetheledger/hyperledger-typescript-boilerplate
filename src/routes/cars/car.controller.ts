import { Body, Controller, Get, Headers, Inject, Post } from '@nestjs/common';
import { CarService } from './car.service';
import { CarDto } from './car.model';
import { InvokeResult } from '../invokeresult.model';
import { ApiBearerAuth, ApiUseTags } from '@nestjs/swagger';
import { IAuthService } from '../../services/authentication/authentication.interface';

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
        @Inject('IAuthService') private authService: IAuthService
    ) {
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