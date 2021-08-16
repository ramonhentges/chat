import { NestFactory } from '@nestjs/core';
//import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { ModelNotFoundExceptionFilter } from './exception-filters/model-not-found.exception-filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalFilters(new ModelNotFoundExceptionFilter());
  //useContainer(app.select(AppModule), { fallbackOnErrors: true });
  await app.listen(process.env.NEST_API_PORT);
}
bootstrap();
