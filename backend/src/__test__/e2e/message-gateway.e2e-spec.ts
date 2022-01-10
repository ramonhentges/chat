import {
  TypeormGroupRepository,
  TypeormMessageRepository,
  TypeormReadedByRepository,
  TypeormUserRepository
} from '@/external/repositories/typeorm';
import { Group, Message, ReadedBy } from '@/models';
import { AuthService } from '@/modules/auth/auth.service';
import { AddRemoveUserToGroupDto } from '@/modules/group/dto';
import { GroupModule } from '@/modules/group/group.module';
import { MessageDto } from '@/modules/message/dto/message.dto';
import { MessageModule } from '@/modules/message/message.module';
import {
  GroupRepository,
  MessageRepository,
  ReadedByRepository,
  UserRepository
} from '@/ports';
import GroupBuilder from '@/__test__/builder/group-builder';
import UserBuilder from '@/__test__/builder/user-builder';
import { JwtAuthGuardDouble } from '@/__test__/doubles/auth';
import {
  InMemoryGroupRepository,
  InMemoryMessageRepository,
  InMemoryReadedByRepository,
  InMemoryUserRepository
} from '@/__test__/doubles/repositories';
import { getClientWebsocketForApp } from '../helpers';
import { createMock } from '@golevelup/ts-jest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { Socket } from 'socket.io-client';
import * as request from 'supertest';
import { initializeApp } from '../helpers';

describe('MessageGateway (e2e)', () => {
  let sut: INestApplication;
  let userRepository: UserRepository;
  let groupRepository: GroupRepository;
  let messageRepository: MessageRepository;
  let readedByRepository: ReadedByRepository;
  let userSocket: Socket;
  let contactSocket: Socket;
  const mockAuthService = createMock<AuthService>();
  const user = UserBuilder.aUser().build();
  const contact = UserBuilder.aUser().newId().newUsername().build();
  const group = GroupBuilder.aGroup().build();

  beforeEach(async () => {
    userRepository = new InMemoryUserRepository([
      { ...user, groups: [group] },
      { ...contact, groups: [group] }
    ]);
    groupRepository = new InMemoryGroupRepository([
      { ...group, users: [user, contact] }
    ]);
    messageRepository = new InMemoryMessageRepository([]);
    readedByRepository = new InMemoryReadedByRepository([]);

    const moduleFixture = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          cache: true,
          isGlobal: true
        }),
        MessageModule,
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
      .useValue(messageRepository)
      .overrideProvider(TypeormReadedByRepository)
      .useValue(readedByRepository)
      .overrideProvider(AuthService)
      .useValue(mockAuthService)
      .compile();

    mockAuthService.validate.mockImplementation(async (payload) => {
      if (payload !== 'undefined') {
        return JSON.parse(payload);
      }
      return undefined;
    });

    sut = await initializeApp(moduleFixture);
    userSocket = getClientWebsocketForApp(sut, user);
    contactSocket = getClientWebsocketForApp(sut, contact);
  });

  beforeEach((done) => {
    let oneConnected = false;
    userSocket.on('connect', () => {
      if (oneConnected) {
        done();
      }
      oneConnected = true;
    });
    contactSocket.on('connect', () => {
      if (oneConnected) {
        done();
      }
      oneConnected = true;
    });
    userSocket.connect();
    contactSocket.connect();
  });

  describe('When try to connect', () => {
    it('should disconnect, unauthorized', (done) => {
      const socket = getClientWebsocketForApp(sut);
      socket.connect();
      socket.on('disconnect', () => {
        socket.close();
        done();
      });
    });
  });

  describe('When send message to a group', () => {
    it('should throw unprocessable entity exception, invalid data', (done) => {
      const data: MessageDto = {
        destination: '',
        message: ''
      };
      userSocket.on('exception', (error: MessageDto) => {
        expect(error.message).toBeDefined();
        expect(error.destination).toBeDefined();
        done();
      });

      userSocket.emit('msgToGroup', data);
    });

    it('should throw forbidden exception, user not in group', async (done) => {
      const groupDb = await groupRepository.add({
        description: 'abcc',
        name: 'cde',
        users: []
      });
      const data: MessageDto = {
        destination: groupDb.id,
        message: 'some message'
      };
      userSocket.on('exception', (error) => {
        expect(error.status).toBe('error');
        expect(error.message).toBeDefined();
        done();
      });

      userSocket.emit('msgToGroup', data);
    });

    it('participants should receive the message', (done) => {
      const data: MessageDto = {
        destination: group.id,
        message: 'some message'
      };
      contactSocket.on('msgFromGroup', (message: Message) => {
        expect(message.message).toBe(data.message);
        expect(message.groupDestination.id).toBe(group.id);
        expect(message.groupDestination.name).toBe(group.name);
        done();
      });
      userSocket.emit('msgToGroup', data);
    });

    it('sender should receive the message', (done) => {
      const data: MessageDto = {
        destination: group.id,
        message: 'some message'
      };
      userSocket.on('msgFromGroup', (message: Message) => {
        expect(message.message).toBe(data.message);
        expect(message.groupDestination.id).toBe(group.id);
        expect(message.groupDestination.name).toBe(group.name);
        done();
      });
      userSocket.emit('msgToGroup', data);
    });
  });

  describe('When send message to a user', () => {
    it('should throw unprocessable entity exception, invalid data', (done) => {
      const data: MessageDto = {
        destination: '',
        message: ''
      };
      userSocket.on('exception', (error: MessageDto) => {
        expect(error.message).toBeDefined();
        expect(error.destination).toBeDefined();
        done();
      });

      userSocket.emit('msgToUser', data);
    });

    it('should throw user not found exception, invalid contact username', (done) => {
      const data: MessageDto = {
        destination: 'not-a-user',
        message: 'hello'
      };
      userSocket.on('exception', (error) => {
        expect(error.message).toBeDefined();
        expect(error.status).toBe('error');
        done();
      });

      userSocket.emit('msgToUser', data);
    });

    it('contact should receive the message', (done) => {
      const data: MessageDto = {
        destination: contact.username,
        message: 'some message'
      };
      contactSocket.on('msgFromUser', (message: Message) => {
        expect(message.message).toBe(data.message);
        expect(message.origin.username).toBe(user.username);
        expect(message.userDestination.username).toBe(contact.username);
        done();
      });
      userSocket.emit('msgToUser', data);
    });

    it('sender should receive the message', (done) => {
      const data: MessageDto = {
        destination: contact.username,
        message: 'some message'
      };
      userSocket.on('sendedMsgFromUser', (message: Message) => {
        expect(message.message).toBe(data.message);
        expect(message.origin.username).toBe(user.username);
        expect(message.userDestination.username).toBe(contact.username);
        done();
      });
      userSocket.emit('msgToUser', data);
    });
  });

  describe('When delete a group message', () => {
    it('should throw forbidden exception, message not of user', async (done) => {
      const message = await messageRepository.addGroupMessage(
        group,
        'some message',
        contact
      );
      userSocket.on('exception', (error) => {
        expect(error.status).toBe('error');
        expect(error.message).toBeDefined();
        done();
      });

      userSocket.emit('deleteGroupMessage', message.id);
    });

    it('should return deleted message to participants', async (done) => {
      const message = await messageRepository.addGroupMessage(
        group,
        'some message',
        user
      );
      contactSocket.on('deletedGroupMessage', (message: Message) => {
        expect(message.deleted).toBe(true);
        expect(message.message).toBe('');
        expect(message.groupDestination.id).toBe(group.id);
        expect(message.groupDestination.name).toBe(group.name);
        done();
      });

      userSocket.emit('deleteGroupMessage', message.id);
    });

    it('should return deleted message to sender', async (done) => {
      const message = await messageRepository.addGroupMessage(
        group,
        'some message',
        user
      );
      userSocket.on('deletedGroupMessage', (message: Message) => {
        expect(message.deleted).toBe(true);
        expect(message.message).toBe('');
        expect(message.groupDestination.id).toBe(group.id);
        expect(message.groupDestination.name).toBe(group.name);
        done();
      });

      userSocket.emit('deleteGroupMessage', message.id);
    });
  });

  describe('When delete a user message', () => {
    it('should throw forbidden exception, message not of user', async (done) => {
      const message = await messageRepository.addContactMessage(
        user,
        'some message',
        contact
      );
      userSocket.on('exception', (error) => {
        expect(error.status).toBe('error');
        expect(error.message).toBeDefined();
        done();
      });

      userSocket.emit('deleteUserMessage', message.id);
    });

    it('should emit deleted message to contact', async (done) => {
      const message = await messageRepository.addContactMessage(
        contact,
        'some message',
        user
      );
      contactSocket.on('deletedUserMessage', (message: Message) => {
        expect(message.deleted).toBe(true);
        expect(message.message).toBe('');
        expect(message.origin.username).toBe(user.username);
        expect(message.userDestination.username).toBe(contact.username);
        done();
      });

      userSocket.emit('deleteUserMessage', message.id);
    });

    it('should emit deleted message to sender', async (done) => {
      const message = await messageRepository.addContactMessage(
        contact,
        'some message',
        user
      );
      userSocket.on('deletedUserMessage', (message: Message) => {
        expect(message.deleted).toBe(true);
        expect(message.message).toBe('');
        expect(message.origin.username).toBe(user.username);
        expect(message.userDestination.username).toBe(contact.username);
        done();
      });

      userSocket.emit('deleteUserMessage', message.id);
    });
  });

  describe('When add user to group', () => {
    it('should emit joined group to user', async (done) => {
      await groupRepository.removeUser(contact, group.id);
      const data: AddRemoveUserToGroupDto = {
        username: contact.username,
        groupId: group.id
      };

      contactSocket.on('joinedGroup', (joinedGroup: Group) => {
        expect(joinedGroup.id).toBe(group.id);
        expect(joinedGroup.description).toBe(group.description);
        done();
      });

      await request(sut.getHttpServer())
        .post('/groups/add-user')
        .send(data)
        .set('Authorization', JSON.stringify(user))
        .expect(HttpStatus.CREATED);
    });
  });

  describe('When remove user from group', () => {
    it('should emit joined group to user', async (done) => {
      contactSocket.on('leavedGroup', (leavedGroup: Group) => {
        expect(leavedGroup.id).toBe(group.id);
        expect(leavedGroup.description).toBe(group.description);
        done();
      });

      await request(sut.getHttpServer())
        .delete(`/groups/remove-user/${group.id}/${contact.username}`)
        .set('Authorization', JSON.stringify(user))
        .expect(HttpStatus.NO_CONTENT);
    });
  });

  describe('When mark a message as readed', () => {
    it('should throw forbidden exception, origin cant read the message', async (done) => {
      const message = await messageRepository.addContactMessage(
        contact,
        'some message',
        user
      );
      userSocket.on('exception', (error) => {
        expect(error.status).toBe('error');
        expect(error.message).toBeDefined();
        done();
      });

      userSocket.emit('markAsReaded', [message.id]);
    });

    it('should emit readed by to origin', async (done) => {
      const message = await messageRepository.addContactMessage(
        contact,
        'some message',
        user
      );
      userSocket.on('markAsReaded', (readedBy: ReadedBy) => {
        expect(readedBy).toHaveProperty('id');
        expect(readedBy).toHaveProperty('user');
        expect(readedBy).toHaveProperty('readedAt');
        expect(readedBy.message).toHaveProperty('id');
        done();
      });

      contactSocket.emit('markAsReaded', [message.id]);
    });

    it('should emit readed by to group', async (done) => {
      const message = await messageRepository.addGroupMessage(
        group,
        'some message',
        user
      );
      userSocket.on('markAsReaded', (readedBy: ReadedBy) => {
        expect(readedBy).toHaveProperty('id');
        expect(readedBy).toHaveProperty('user');
        expect(readedBy).toHaveProperty('readedAt');
        expect(readedBy.message).toHaveProperty('id');
        done();
      });

      contactSocket.emit('markAsReaded', [message.id]);
    });
  });

  afterEach(async () => {
    userSocket.close();
    contactSocket.close();
    await sut.close();
  });
});
