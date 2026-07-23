import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  try {
    const app = await NestFactory.create(AppModule);
    app.use(helmet({ contentSecurityPolicy: false }));
    app.enableCors({ origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:5173' });
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    const config = new DocumentBuilder()
      .setTitle('HealthApp API')
      .setDescription('API de monitoramento de saúde')
      .setVersion('0.1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const port = process.env.PORT || 3333;
    await app.listen(port, '0.0.0.0');
    logger.log(`API running on http://0.0.0.0:${port}`);
  } catch (err) {
    logger.error(`Bootstrap failed: ${err.message}`);
    process.exit(1);
  }
}
void bootstrap();