import {
  TypeormGroupRepository,
  TypeormMessageRepository,
  TypeormUserRepository
} from '@/external/repositories/typeorm';
import { MessagesGateway } from '@/gateways/messages.gateway';
import { MessageModule } from '@/modules/message/message.module';
import { GroupRepository, MessageRepository, UserRepository } from '@/ports';
import GroupBuilder from '@/__test__/builder/group-builder';
import UserBuilder from '@/__test__/builder/user-builder';
import { JwtAuthGuardDouble } from '@/__test__/doubles/auth';
import {
  InMemoryGroupRepository,
  InMemoryMessageRepository,
  InMemoryUserRepository
} from '@/__test__/doubles/repositories';
import { createMock } from '@golevelup/ts-jest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { initializeApp } from '../initilize-app';

describe('MessageController (e2e)', () => {
  let sut: INestApplication;
  let userRepository: UserRepository;
  let groupRepository: GroupRepository;
  let messageRepository: MessageRepository;
  const mockMessageGateway = createMock<MessagesGateway>();
  const user = UserBuilder.aUser().build();
  const contact = UserBuilder.aUser().newId().newUsername().build();
  const group = GroupBuilder.aGroup().build();
  const authToken = JSON.stringify(user);

  beforeEach(async () => {
    userRepository = new InMemoryUserRepository([
      { ...user, groups: [group] },
      { ...contact, groups: [group] }
    ]);
    groupRepository = new InMemoryGroupRepository([
      { ...group, users: [user, contact] }
    ]);
    messageRepository = new InMemoryMessageRepository([]);
    await seedMessageRepository(messageRepository);
    const moduleFixture = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          cache: true,
          isGlobal: true
        }),
        MessageModule
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
      .overrideProvider(TypeormGroupRepository)
      .useValue(groupRepository)
      .overrideProvider(TypeormMessageRepository)
      .useValue(messageRepository)
      .overrideProvider(MessagesGateway)
      .useValue(mockMessageGateway)
      .compile();

    jest.resetAllMocks();
    sut = await initializeApp(moduleFixture);
  });

  describe('When GET /group-message/:id', () => {
    it('should not get message, unauthorized', async () => {
      return request(sut.getHttpServer())
        .get(`/group-message/${group.id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should not get group message, unprocessable entity, invalid query', async () => {
      return request(sut.getHttpServer())
        .get(`/group-message/${group.id}`)
        .set('Authorization', authToken)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);
    });

    it('should get group messages,', async () => {
      return request(sut.getHttpServer())
        .get(`/group-message/${group.id}?take=40&skip=0`)
        .set('Authorization', authToken)
        .expect(HttpStatus.OK);
    });
  });

  describe('When GET /group-message/last/:id', () => {
    it('should not get message, unauthorized', async () => {
      return request(sut.getHttpServer())
        .get(`/group-message/last/${group.id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should get last group messages,', async () => {
      return request(sut.getHttpServer())
        .get(`/group-message/last/${group.id}`)
        .set('Authorization', authToken)
        .expect(HttpStatus.OK);
    });
  });

  describe('When GET /user-message/:username', () => {
    it('should not get messages, unauthorized', async () => {
      return request(sut.getHttpServer())
        .get(`/user-message/${contact.username}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should not get user messages, unprocessable entity, invalid query', async () => {
      return request(sut.getHttpServer())
        .get(`/user-message/${contact.username}`)
        .set('Authorization', authToken)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);
    });

    it('should get user messages,', async () => {
      return request(sut.getHttpServer())
        .get(`/user-message/${contact.username}?take=40&skip=0`)
        .set('Authorization', authToken)
        .expect(HttpStatus.OK);
    });
  });

  describe('When GET /user-message/last/messages', () => {
    it('should not get last messages, unauthorized', async () => {
      return request(sut.getHttpServer())
        .get(`/user-message/last/messages`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should get last user messages,', async () => {
      return request(sut.getHttpServer())
        .get(`/user-message/last/messages`)
        .set('Authorization', authToken)
        .expect(HttpStatus.OK);
    });
  });

  afterEach(async () => {
    await sut.close();
  });
});

async function seedMessageRepository(messageRepository: MessageRepository) {
  const userA = UserBuilder.aUser().build();
  const userB = UserBuilder.aUser().newId().newUsername().build();
  const group = GroupBuilder.aGroup().build();
  const message = 'some message';
  for (let i = 0; i < 35; i++) {
    if (i % 4 === 0) {
      await messageRepository.addGroupMessage(group, message, userA);
    } else if (i % 3 === 0) {
      await messageRepository.addGroupMessage(group, message, userB);
    } else if (i % 2 === 0) {
      await messageRepository.addContactMessage(userA, message, userB);
    } else {
      await messageRepository.addContactMessage(userB, message, userA);
    }
  }
}
