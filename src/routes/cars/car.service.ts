import { BadRequestException, Component, InternalServerErrorException } from '@nestjs/common';
import * as Yup from 'yup';
import { ChainMethod } from '../chainmethods.enum';
import { CarDto } from './car.model';
import { InvokeResult } from '../invokeresult.model';
import { RequestHelper } from '../../services/chain/requesthelper';
import { IAuthUser } from "../../services/authentication/authenticateduser";

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
     * @memberof AssetsService
     */
    getAll(): Promise<CarDto[]> {
        // this is a query, query chaincode directly
        return this.requestHelper.queryRequest(ChainMethod.queryAllCars, [])
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
     * @memberof AssetsService
     */
    create(carDto: CarDto, authUser: IAuthUser): Promise<InvokeResult> {
        const schema = Yup.object().shape({
            Key: Yup.string().required(),
            Make: Yup.string().required(),
            Model: Yup.string().required(),
            Colour: Yup.string().required(),
            Owner: Yup.string().required()
        });

        // TODO: replace yup with validation pipe
        return this.requestHelper.validateRequest(schema, carDto)
            .then(params => {
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
            })
            .catch(error => {
                throw new BadRequestException(error);
            });
    }
}
