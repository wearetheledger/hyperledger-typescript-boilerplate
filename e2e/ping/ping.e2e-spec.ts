import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ApplicationModule } from '../../src/modules/app.module';

describe('Ping', () => {
    let app: INestApplication;
    let pingService = {ping: () => 'Chain service api is up and running. (<a href="/api">Open Swagger</a>)'};

    beforeAll(async () => {

        const module = await Test.createTestingModule({
            imports: [ApplicationModule],
        })
            .compile();

        app = module.createNestApplication();
        await app.init();
    });

    it(`/GET / - ping`, async () => {
        return request(app.getHttpServer())
            .get('/')
            .expect(200)
            .expect(pingService.ping());
    });

    afterAll(async () => {
        await app.close();
    });
});