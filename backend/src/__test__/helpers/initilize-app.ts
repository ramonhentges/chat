import { ModelNotFoundExceptionFilter } from '@/exception-filters/model-not-found.exception-filter';
import { getValidationPipe } from '@/validation/validation-pipe';
import { NestExpressApplication } from '@nestjs/platform-express';
import { TestingModule } from '@nestjs/testing';
import * as passport from 'passport';

export const initializeApp = async (moduleFixture: TestingModule) => {
  const app = moduleFixture.createNestApplication<NestExpressApplication>();
  app.useGlobalFilters(new ModelNotFoundExceptionFilter());
  app.useGlobalPipes(getValidationPipe('api'));
  app.use(passport.initialize());
  await app.init();
  return app;
};
