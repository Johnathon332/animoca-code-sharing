import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CustomExceptionFilter } from './exceptions/filter';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api/v1');

  app.useGlobalFilters(new CustomExceptionFilter());

  app.use(helmet())
  // app.use(csurf({ cookie: true }));
  await app.listen(configService.get<number>('PORT')!);
}

bootstrap();
