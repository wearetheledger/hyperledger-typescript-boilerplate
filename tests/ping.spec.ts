import { ApplicationModule } from './../src/modules/app.module';
import * as express from 'express';
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { PingService } from '../src/routes/ping/ping.service';
import { config as awsConfig } from 'aws-sdk';
import { EnvConfig } from '../src/config/env';

/**
 * Set AWS Credentials
 */
awsConfig.update({
    accessKeyId: EnvConfig.AWS_ACCESS_KEY,
    secretAccessKey: EnvConfig.AWS_SECRET_ACCESS_KEY,
    region: EnvConfig.AWS_REGION
});


describe('Ping', () => {
    const server = express();

    const pingService_ping = { ping: () => 'test' };
    const assetService_getAll = { getAll: () => 'test' };
    const assetService_create = { create: () => 'test' };

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [ApplicationModule],
        })
            .overrideComponent(PingService).useValue(pingService_ping)
            .compile();

        const app = module.createNestApplication(server);
        await app.init();
    });

    it(`/GET ping`, () => {
        return request(server)
            .get('/')
            .expect(200)
            .expect(pingService_ping.ping());
    });

    it(`/GET getAll`, () => {
        return request(server)
            .get('/assets')
            .expect(200)
            .expect(assetService_getAll.getAll());
    });

    it(`/Post create`, () => {
        return request(server)
            .post('/assets')
            .expect(201)
            .expect(assetService_create.create());
    });
});