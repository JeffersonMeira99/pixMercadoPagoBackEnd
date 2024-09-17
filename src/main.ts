import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AppLogger } from './logger/app-logger.service';
import * as cookieParser from 'cookie-parser';  // Use this import style
import { ConfigService } from '@nestjs/config';
import { stringToBool } from './utils/common/string-to-bool';
import { setupSwagger } from './swagger/setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get<ConfigService>(ConfigService);

  app.useGlobalPipes(new ValidationPipe());

  if (stringToBool(configService.get('SWAGGER_ENABLED'))) {
    setupSwagger(app);
  }

  app.useLogger(app.get(AppLogger));
  app.use(cookieParser());

  const port = configService.get<number>('PORT');
  await app.listen(port ?? 3000);
}
bootstrap();