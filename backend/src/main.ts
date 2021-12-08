import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ModelNotFoundExceptionFilter } from './exception-filters/model-not-found.exception-filter';
import { transformErrorResponse } from './validation/transform-error';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalFilters(new ModelNotFoundExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      validationError: {
        target: false,
        value: false
      },
      exceptionFactory: (errors) =>
        new UnprocessableEntityException(transformErrorResponse(errors))
    })
  );
  await app.listen(process.env.NEST_API_PORT);
}
bootstrap();
