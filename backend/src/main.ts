import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule, { bufferLogs: true });

    app.use(helmet({
      contentSecurityPolicy: false,
    }));
    app.enableCors({
      origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:3000',
      credentials: true,
    });

    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    if (process.env.NODE_ENV !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('HealthApp API')
        .setDescription('API de monitoramento de saúde com suporte a NR-1')
        .setVersion('0.1.0')
        .addBearerAuth()
        .build();
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api/docs', app, document);
    }

    const port = process.env.PORT || 3333;
    await app.listen(port, '0.0.0.0');
    logger.log(`API running on http://0.0.0.0:${port}`);
    logger.log(`Swagger docs at http://0.0.0.0:${port}/api/docs`);
  } catch (err) {
    logger.error(`Bootstrap failed: ${err.message}`);
    if (err.stack) logger.error(err.stack);
    process.exit(1);
  }
}

void bootstrap();