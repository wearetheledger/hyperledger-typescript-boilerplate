import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CarDto } from './car.model';
import { RequestHelper } from '../core/chain/requesthelper';
import { IAuthUser } from '../core/authentication/interfaces/authenticateduser';
import { InvokeResult } from '../common/utils/invokeresult.model';
import { ChainMethod } from '../chainmethods.enum';

@Injectable()
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
        return this.requestHelper.queryRequest(ChainMethod.queryAllCars).catch((error) => {
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
        return this.requestHelper.queryRequest(ChainMethod.queryCar, {key: id}).then(
            (car) => {
                if (!car) {
                    throw new NotFoundException('Car does not exist!');
                }
                return car;
            },
            (error) => {
                throw new InternalServerErrorException(error);
            },
        );
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
        return this.requestHelper.invokeRequest(ChainMethod.createCar, carDto, authUser.id, false)
            .catch((error) => {
                throw new InternalServerErrorException(error);
            });
    }
}
