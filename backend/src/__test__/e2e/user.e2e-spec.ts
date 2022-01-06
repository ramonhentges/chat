import { TypeormUserRepository } from '@/external/repositories/typeorm';
import { UpdateUserDto } from '@/modules/user/dto/edit-user.dto';
import { UserDto } from '@/modules/user/dto/user.dto';
import { UserModule } from '@/modules/user/user.module';
import { UserRepository } from '@/ports';
import UserBuilder from '@/__test__/builder/user-builder';
import { JwtAuthGuardDouble } from '@/__test__/doubles/auth';
import { InMemoryUserRepository } from '@/__test__/doubles/repositories';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { initializeApp } from '../helpers';

describe('UserController (e2e)', () => {
  let sut: INestApplication;
  let userRepository: UserRepository;
  const user = UserBuilder.aUser().build();
  const authToken = JSON.stringify(user);

  beforeEach(async () => {
    userRepository = new InMemoryUserRepository([{ ...user, groups: [] }]);
    const moduleFixture = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          cache: true,
          isGlobal: true
        }),
        UserModule
      ],
      providers: [
        {
          provide: APP_GUARD,
          useExisting: JwtAuthGuardDouble
        },
        JwtAuthGuardDouble
      ]
    })
      .overrideProvider(TypeormUserRepository)
      .useValue(userRepository)
      .compile();

    jest.resetAllMocks();
    sut = await initializeApp(moduleFixture);
  });

  describe('When GET /users', () => {
    it('should not get users, unauthorized', async () => {
      return request(sut.getHttpServer())
        .get('/users')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should get all users', async () => {
      return request(sut.getHttpServer())
        .get('/users')
        .set('Authorization', authToken)
        .expect(HttpStatus.OK);
    });
  });

  describe('When GET /users/my/user', () => {
    it('should not get user info, unauthorized', async () => {
      return request(sut.getHttpServer())
        .get('/users/my/user')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should get logged user info', async () => {
      const response = await request(sut.getHttpServer())
        .get('/users/my/user')
        .set('Authorization', authToken)
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('username', user.username);
    });
  });

  describe('When GET users/:username', () => {
    it('should not get user info, unauthorized', async () => {
      return request(sut.getHttpServer())
        .get(`/users/${user.username}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should get user not found status', async () => {
      return request(sut.getHttpServer())
        .get(`/users/not-in-db`)
        .set('Authorization', authToken)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should get user info by username', async () => {
      return request(sut.getHttpServer())
        .get(`/users/${user.username}`)
        .set('Authorization', authToken)
        .expect(HttpStatus.OK);
    });
  });

  describe('When POST /users', () => {
    it('should throw user already exists error', async () => {
      const data: UserDto = {
        username: user.username,
        fullName: 'Other name',
        password: '9876543210'
      };

      return request(sut.getHttpServer())
        .post('/users')
        .send(data)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);
    });

    it('should throw unprocessable entity error, invalid data', async () => {
      const data: UserDto = {
        username: 'shor',
        fullName: 'in',
        password: '98765'
      };

      const response = await request(sut.getHttpServer())
        .post('/users')
        .send(data)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);

      expect(response.body).toHaveProperty('username');
      expect(response.body).toHaveProperty('fullName');
      expect(response.body).toHaveProperty('password');
    });

    it('should create the user', async () => {
      const data: UserDto = {
        username: 'otherusername',
        fullName: 'Other name',
        password: '9876543210'
      };

      return request(sut.getHttpServer())
        .post('/users')
        .send(data)
        .expect(HttpStatus.CREATED);
    });
  });

  describe('When PUT /users', () => {
    it('should not update user, unauthorized', async () => {
      return request(sut.getHttpServer())
        .put('/users')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should throw unprocessable entity error, invalid data', async () => {
      const data: UpdateUserDto = {
        fullName: 'in',
        password: '98765'
      };

      const response = await request(sut.getHttpServer())
        .put('/users')
        .send(data)
        .set('Authorization', authToken)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);

      expect(response.body).toHaveProperty('fullName');
      expect(response.body).toHaveProperty('password');
    });

    it('should update the user', async () => {
      const data: UpdateUserDto = {
        fullName: 'Other name',
        password: '9876543210'
      };

      return request(sut.getHttpServer())
        .put('/users')
        .send(data)
        .set('Authorization', authToken)
        .expect(HttpStatus.OK);
    });
  });

  afterEach(async () => {
    await sut.close();
  });
});
