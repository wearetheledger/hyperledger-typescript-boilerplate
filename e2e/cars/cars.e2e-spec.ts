import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { CarDto } from '../../src/cars/car.model';
import { HlfClient } from '../../src/core/chain/hlfclient';
import { CarService } from '../../src/cars/car.service';
import { ApplicationModule } from '../../src/app.module';
import { HlfCaClient } from '../../src/core/chain/hlfcaclient';

describe('Cars', () => {
    let app: INestApplication;
    let carService = {
        getAll: (): CarDto[] => [
            {
                key: '111111',
                make: 'volvo',
                model: 'v40',
                color: 'black',
                owner: 'Peter'
            },
            {
                key: '222222',
                make: 'opel',
                model: 'astra',
                color: 'red',
                owner: 'Jan'
            }
        ],
        getById: () => ({
            key: '222222',
            make: 'opel',
            model: 'astra',
            color: 'red',
            owner: 'Jan'
        })
    };

    let mockService = {
        init: () => Promise.resolve()
    };

    beforeAll(async () => {

        const module = await Test.createTestingModule({
            imports: [ApplicationModule],
        })
            .overrideProvider(CarService)
            .useValue(carService)

            // Mock these to override inits
            .overrideProvider(HlfClient)
            .useValue(mockService)
            .overrideProvider(HlfCaClient)
            .useValue(mockService)
            .compile();

        app = module.createNestApplication();
        await app.init();
    });

    it(`/GET /cars - Get all cars`, async () => {
        return request(app.getHttpServer())
            .get('/cars')
            .expect(200)
            .expect(carService.getAll());
    });

    it(`/GET /cars/:id - Get a cars`, async () => {
        return request(app.getHttpServer())
            .get('/cars/222222')
            .expect(200)
            .expect(carService.getById());
    });

    afterAll(async () => {
        await app.close();
    });
});