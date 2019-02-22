import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ApplicationModule } from '../../src/app.module';
import { HlfClient } from '../../src/core/chain/hlfclient';
import { HlfCaClient } from '../../src/core/chain/hlfcaclient';

describe('Ping', () => {
    let app: INestApplication;
    let pingService = {ping: () => 'Chain service api is up and running. (<a href="/api">Open Swagger</a>)'};

    let mockService = {
        init: () => Promise.resolve()
    };

    beforeAll(async () => {

        const module = await Test.createTestingModule({
            imports: [ApplicationModule],
        })

        // Mock these to override inits
            .overrideProvider(HlfClient)
            .useValue(mockService)
            .overrideProvider(HlfCaClient)
            .useValue(mockService)
            .compile();

        app = module.createNestApplication();
        await app.init();
    });

    it(`GET / - ping`, async () => {
        return request(app.getHttpServer())
            .get('/')
            .expect(200)
            .expect(pingService.ping());
    });

    afterAll(async () => {
        await app.close();
    });
});