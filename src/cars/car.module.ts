import { Module, NestModule } from '@nestjs/common';
import { CarController } from './car.controller';
import { CarService } from './car.service';
import { MiddlewareConsumer } from '@nestjs/common/interfaces/middleware';
import { EnvConfig } from '../common/config/env';
import { JwtauthenticationMiddleware } from '../common/middleware/jwtauthentication.middleware';
import { HlfcredsgeneratorMiddleware } from '../common/middleware/hlfcredsgenerator.middleware';
import { AuthenticationModule } from '../core/authentication/authentication.module';
import { ChainModule } from '../core/chain/chain.module';

@Module({
    controllers: [
        CarController,
    ],
    providers: [
        CarService,
    ],
    imports: [
        AuthenticationModule,
        ChainModule,
    ]
})
export class CarModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {

        if (!EnvConfig.SKIP_MIDDLEWARE) {
            consumer
                .apply([JwtauthenticationMiddleware, HlfcredsgeneratorMiddleware])
                .forRoutes(CarController);
        }
    }
}
