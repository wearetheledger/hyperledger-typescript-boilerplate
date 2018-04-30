import { Component, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ChainMethod } from '../chainmethods.enum';
import { CarDto } from './car.model';
import { InvokeResult } from '../invokeresult.model';
import { RequestHelper } from '../../services/chain/requesthelper';
import { IAuthUser } from '../../modules/auth/authenticateduser';

@Component()
export class CarService {

    /**
     * Creates an instance of CarService.
     * @param {RequestHelper} requestHelper
     * @memberof CarService
     */
    constructor(private requestHelper: RequestHelper) {
    }

    /**
     * Get all cars
     *
     * @returns {Promise<CarDto[]>}
     * @memberof CarService
     */
    getAll(): Promise<CarDto[]> {
        return this.requestHelper.queryRequest(ChainMethod.queryAllCars, [])
            .catch(error => {
                throw new InternalServerErrorException(error);
            });
    }

    /**
     * Get car by id
     *
     * @returns {Promise<CarDto>}
     * @memberof CarService
     */
    getById(id: string): Promise<CarDto> {
        return this.requestHelper.queryRequest(ChainMethod.queryCar, [id])
            .then(car => {
                if (!car) {
                    throw new NotFoundException('Car does not exist!');
                }
                return car;
            }, error => {
                throw new InternalServerErrorException(error);
            });
    }

    /**
     * Create new car
     *
     * @param {CarDto} carDto
     * @param {IAuthUser} authUser
     * @returns {Promise<InvokeResult>}
     * @memberof CarService
     */
    create(carDto: CarDto, authUser: IAuthUser): Promise<InvokeResult> {
        return this.requestHelper.invokeRequest(ChainMethod.createCar, [
            carDto.Colour,
            carDto.Key,
            carDto.Make,
            carDto.Model,
            carDto.Owner,
        ], authUser.id)
            .catch(error => {
                throw new InternalServerErrorException(error);
            });
    }
}
