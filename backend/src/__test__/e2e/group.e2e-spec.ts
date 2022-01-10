import {
  TypeormGroupRepository,
  TypeormMessageRepository,
  TypeormReadedByRepository,
  TypeormUserRepository
} from '@/external/repositories/typeorm';
import { MessagesGateway } from '@/gateways/messages.gateway';
import { AddRemoveUserToGroupDto, GroupDto } from '@/modules/group/dto';
import { GroupModule } from '@/modules/group/group.module';
import { GroupRepository, MessageRepository, ReadedByRepository, UserRepository } from '@/ports';
import GroupBuilder from '@/__test__/builder/group-builder';
import UserBuilder from '@/__test__/builder/user-builder';
import { JwtAuthGuardDouble } from '@/__test__/doubles/auth';
import {
  InMemoryGroupRepository,
  InMemoryUserRepository
} from '@/__test__/doubles/repositories';
import { createMock } from '@golevelup/ts-jest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { initializeApp } from '../helpers';

describe('GroupController (e2e)', () => {
  let sut: INestApplication;
  let userRepository: UserRepository;
  let groupRepository: GroupRepository;
  const mockMessageGateway = createMock<MessagesGateway>();
  const mockMessageRepository = createMock<MessageRepository>();
  const mockReadedByRepository = createMock<ReadedByRepository>();
  const user = UserBuilder.aUser().build();
  const group = GroupBuilder.aGroup().build();
  const authToken = JSON.stringify(user);

  beforeEach(async () => {
    userRepository = new InMemoryUserRepository([{ ...user, groups: [group] }]);
    groupRepository = new InMemoryGroupRepository([
      { ...group, users: [user] }
    ]);
    const moduleFixture = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          cache: true,
          isGlobal: true
        }),
        GroupModule
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
      .useValue(mockMessageRepository)
      .overrideProvider(TypeormReadedByRepository)
      .useValue(mockReadedByRepository)
      .overrideProvider(MessagesGateway)
      .useValue(mockMessageGateway)
      .compile();

    jest.resetAllMocks();
    sut = await initializeApp(moduleFixture);
  });

  describe('When GET /groups', () => {
    it('should not get groups, unauthorized', async () => {
      return request(sut.getHttpServer())
        .get('/groups')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should get user groups', async () => {
      return request(sut.getHttpServer())
        .get('/groups')
        .set('Authorization', authToken)
        .expect(HttpStatus.OK);
    });
  });

  describe('When GET /groups/:id', () => {
    it('should not get groups, unauthorized', async () => {
      return request(sut.getHttpServer())
        .get(`/groups/${group.id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should get the group', async () => {
      return request(sut.getHttpServer())
        .get(`/groups/${group.id}`)
        .set('Authorization', authToken)
        .expect(HttpStatus.OK);
    });

    it('should get forbidden status', async () => {
      const group = GroupBuilder.aGroup().build();
      const dbGroup = await groupRepository.add(group);

      return request(sut.getHttpServer())
        .get(`/groups/${dbGroup.id}`)
        .set('Authorization', authToken)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('When POST /groups', () => {
    it('should not create group, unauthorized', async () => {
      return request(sut.getHttpServer())
        .post('/groups')
        .send()
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should not create group, unprocessable entity, invalid data', async () => {
      const response = await request(sut.getHttpServer())
        .post('/groups')
        .send()
        .set('Authorization', authToken)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);

      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('description');
    });

    it('should not create group, unprocessable entity, invalid name', async () => {
      const data: GroupDto = { name: 'ab', description: '' };
      const response = await request(sut.getHttpServer())
        .post('/groups')
        .send(data)
        .set('Authorization', authToken)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);

      expect(response.body).toHaveProperty('name');
      expect(response.body).not.toHaveProperty('description');
    });

    it('should not create group, unprocessable entity, invalid description', async () => {
      const data: GroupDto = {
        name: 'Works',
        description: 'some long description here ....'
      };
      const response = await request(sut.getHttpServer())
        .post('/groups')
        .send(data)
        .set('Authorization', authToken)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);

      expect(response.body).not.toHaveProperty('name');
      expect(response.body).toHaveProperty('description');
    });

    it('should create the group', async () => {
      const data: GroupDto = { name: 'Works', description: '' };
      return request(sut.getHttpServer())
        .post('/groups')
        .send(data)
        .set('Authorization', authToken)
        .expect(HttpStatus.CREATED);
    });
  });

  describe('When POST /groups/add-user', () => {
    it('should not add user to group, unauthorized', async () => {
      return request(sut.getHttpServer())
        .post('/groups/add-user')
        .send()
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should not add user to group, unprocessable entity, invalid data', async () => {
      const data: AddRemoveUserToGroupDto = { username: 'inv', groupId: '' };
      const response = await request(sut.getHttpServer())
        .post('/groups/add-user')
        .send(data)
        .set('Authorization', authToken)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);

      expect(response.body).toHaveProperty('username');
      expect(response.body).toHaveProperty('groupId');
    });

    it('should not add the user, user not in group', async () => {
      const userToAdd = UserBuilder.aUser().newId().newUsername().build();
      await userRepository.add(userToAdd);
      const group = GroupBuilder.aGroup().build();
      const dbGroup = await groupRepository.add(group);
      const data: AddRemoveUserToGroupDto = {
        username: userToAdd.username,
        groupId: dbGroup.id
      };

      return request(sut.getHttpServer())
        .post('/groups/add-user')
        .send(data)
        .set('Authorization', authToken)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should add the user', async () => {
      const userToAdd = UserBuilder.aUser().newId().newUsername().build();
      await userRepository.add(userToAdd);
      const data: AddRemoveUserToGroupDto = {
        username: userToAdd.username,
        groupId: group.id
      };
      return request(sut.getHttpServer())
        .post('/groups/add-user')
        .send(data)
        .set('Authorization', authToken)
        .expect(HttpStatus.CREATED);
    });
  });

  describe('When DELETE /groups/remove-user/:groupId/:username', () => {
    it('should not remove user from group, unauthorized', async () => {
      return request(sut.getHttpServer())
        .delete(`/groups/remove-user/${group.id}/${user.username}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should not remove the user, request user not in group', async () => {
      const group = GroupBuilder.aGroup().build();
      const dbGroup = await groupRepository.add(group);
      return request(sut.getHttpServer())
        .delete(`/groups/remove-user/${dbGroup.id}/${user.username}`)
        .set('Authorization', authToken)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should remove the user', async () => {
      return request(sut.getHttpServer())
        .delete(`/groups/remove-user/${group.id}/${user.username}`)
        .set('Authorization', authToken)
        .expect(HttpStatus.NO_CONTENT);
    });
  });

  describe('When PUT /groups/:id', () => {
    it('should not update group, unauthorized', async () => {
      return request(sut.getHttpServer())
        .put(`/groups/${group.id}`)
        .send()
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should not update group, unprocessable entity, invalid data', async () => {
      const response = await request(sut.getHttpServer())
        .put(`/groups/${group.id}`)
        .send()
        .set('Authorization', authToken)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);

      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('description');
    });

    it('should not update the group, user not in group', async () => {
      const data: GroupDto = { name: 'Works', description: '' };
      const group = GroupBuilder.aGroup().build();
      const dbGroup = await groupRepository.add(group);
      return request(sut.getHttpServer())
        .put(`/groups/${dbGroup.id}`)
        .send(data)
        .set('Authorization', authToken)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should update the group', async () => {
      const data: GroupDto = { name: 'Works', description: 'Hello!' };
      return request(sut.getHttpServer())
        .put(`/groups/${group.id}`)
        .send(data)
        .set('Authorization', authToken)
        .expect(HttpStatus.OK);
    });
  });

  describe('When DELETE /groups/:id', () => {
    it('should not delete group, unauthorized', async () => {
      return request(sut.getHttpServer())
        .delete(`/groups/${group.id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should not delete the group, user not in group', async () => {
      const group = GroupBuilder.aGroup().build();
      const dbGroup = await groupRepository.add(group);
      return request(sut.getHttpServer())
        .delete(`/groups/${dbGroup.id}`)
        .set('Authorization', authToken)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should delete the group', async () => {
      return request(sut.getHttpServer())
        .delete(`/groups/${group.id}`)
        .set('Authorization', authToken)
        .expect(HttpStatus.NO_CONTENT);
    });
  });

  afterEach(async () => {
    await sut.close();
  });
});
