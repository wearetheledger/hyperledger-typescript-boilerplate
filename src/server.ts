import { EnvConfig } from './config/env';
import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './modules/app.module';
import { Log } from 'hlf-node-utils';
import * as bodyParser from 'body-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {

    const app = await NestFactory.create(ApplicationModule);

    app.use(bodyParser.json());

    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    });

    const options = new DocumentBuilder()
        .setTitle('Chainservice example')
        .setDescription('The Chainservice API description')
        .setVersion('1.0')
        .addTag('Chainservice')
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('/api', app, document);

    //   chainService.init()
    //     .then(() => {
    //       return chainService.query('ping', [], EnvConfig.CHAINCODE_NAME);
    //     })
    //     .then(() => {
    //       Utils.logger.info('Hyperledger fabric connected successfully');
    //     })
    //     .catch((err) => {
    //       Utils.errorMessage('Error starting hyperledger fabric', err);
    //     });

    await app.listen(+EnvConfig.PORT, () => {
        Log.config.info(`Chain-service started on PORT ${EnvConfig.PORT}`);
    });


}
bootstrap();