import { Component, InternalServerErrorException } from '@nestjs/common';
import { ChainMethod } from '../chainmethods.enum';
import { CarDto } from './car.model';
import { InvokeResult } from '../invokeresult.model';
import { RequestHelper } from '../../services/chain/requesthelper';
import { IAuthUser } from '../../services/authentication/authenticateduser';

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
     * get all cars
     *
     * @returns {Promise<CarDto[]>}
     * @memberof CarService
     */
    getAll(): Promise<CarDto[]> {
        // this is a query, query chaincode directly
        return this.requestHelper.queryRequest(ChainMethod.queryAllCars, [])
            .catch(error => {
                throw new InternalServerErrorException(error);
            });
    }

    /**
     * get car by id
     *
     * @returns {Promise<CarDto>}
     * @memberof CarService
     */
    getById(id: string): Promise<CarDto> {
        // this is a query, query chaincode directly
        return this.requestHelper.queryRequest(ChainMethod.queryCar, [id])
            .catch(error => {
                throw new InternalServerErrorException(error);
            });
    }

    /**
     * create new car
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
