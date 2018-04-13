import { EnvConfig } from './config/env';
import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './modules/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { config as awsConfig } from 'aws-sdk';
import * as bodyParser from 'body-parser';
import { Log } from './services/logging/log.service';

/**
 * Set AWS Credentials
 */

awsConfig.update({
    accessKeyId: EnvConfig.AWS_ACCESS_KEY,
    secretAccessKey: EnvConfig.AWS_SECRET_ACCESS_KEY,
    region: EnvConfig.AWS_REGION
});

async function bootstrap() {

    const app = await NestFactory.create(ApplicationModule);

    app.use(bodyParser.json());

    /**
     * Headers setup
     */
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        next();
    });

    /**
     * Swagger implementation
     */
    const options = new DocumentBuilder()
        .setTitle('Chainservice API')
        .setDescription('The Chainservice API')
        .setVersion('1.0')
        .setExternalDoc('Github repo', 'https://github.com/wearetheledger/hyperledger-typescript-boilerplate')
        .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('/api', app, document);

    /**
     * Start Chainservice API
     */
    await app.listen(+EnvConfig.PORT, () => {
        Log.config.info(`Started Chain-service on PORT ${EnvConfig.PORT}`);
    });

}

bootstrap();