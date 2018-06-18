import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PingController } from './ping.controller';
import { PingService } from './ping.service';

describe('PingController', () => {
    let app: TestingModule;

    beforeAll(async () => {
        app = await Test.createTestingModule({
            controllers: [PingController],
            providers: [PingService],
        }).compile();
    });

    describe('ping', () => {
        it('should return "Hello World!"', () => {
            const pingController = app.get<PingController>(PingController);
            expect(pingController.ping()).toBe('Chain service api is up and running. (<a href="/api">Open Swagger</a>)');
        });
    });
});
