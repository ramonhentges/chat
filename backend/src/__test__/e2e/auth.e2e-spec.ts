import { TypeormUserRepository } from '@/external/repositories/typeorm/typeorm-user-repository';
import { TYPES } from '@/factories/types';
import { AuthModule } from '@/modules/auth/auth.module';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { UserRepository } from '@/ports/user-repository';
import UserBuilder from '@/__test__/builder/user-builder';
import { InMemoryUserRepository } from '@/__test__/doubles/repositories';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { DoubleEncoder } from '../doubles/encoder';
import { initializeApp } from '../initilize-app';

describe('AuthController (e2e)', () => {
  let sut: INestApplication;
  let userRepository: UserRepository;
  const user = UserBuilder.aUser().build();

  beforeAll(async () => {
    userRepository = new InMemoryUserRepository([user]);
    const moduleFixture = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          cache: true,
          isGlobal: true
        }),
        AuthModule
      ],
      providers: [
        {
          provide: APP_GUARD,
          useValue: JwtAuthGuard
        }
      ]
    })
      .overrideProvider(TypeormUserRepository)
      .useValue(userRepository)
      .overrideProvider(TYPES.Encoder)
      .useClass(DoubleEncoder)
      .compile();

    sut = await initializeApp(moduleFixture);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('When POST /auth/login', () => {
    it('should login', async () => {
      const response = await request(sut.getHttpServer())
        .post('/auth/login')
        .send({ username: user.username, password: '12345678' })
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('accessToken');
    });

    it('should not login, unauthorized status code', async () => {
      return request(sut.getHttpServer())
        .post('/auth/login')
        .send({ username: user.username, password: '123456' })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  afterAll(async () => {
    await sut.close();
  });
});
