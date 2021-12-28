import { createMock } from '@golevelup/ts-jest';
import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Socket } from 'socket.io';
import { MINUTES_TO_DELETE_MESSAGE } from '@/constants/constants';
import { TypeormMessageRepository } from '@/external/repositories/typeorm/typeorm-message-repository';
import { QueryFilter } from '@/global-dto/query';
import { Message } from '@/models/message.model';
import { GroupService } from '@/modules/group/group.service';
import { UserService } from '@/modules/user/user.service';
import { MessageRepository } from '@/ports/message-repository';
import GroupBuilder from '@/__test__/builder/group-builder';
import JWTTestUtil from '@/__test__/builder/JwtTestUtil';
import MessageBuilder from '@/__test__/builder/message-builder';
import UserBuilder from '@/__test__/builder/user-builder';
import { InMemoryMessageRepository } from '@/__test__/doubles/repositories/in-memory-message-repository';
import { MessageDto } from '../dto/message.dto';
import { MessageService } from '../message.service';

describe('MessageService', () => {
  let sut: MessageService;
  const jwtDto = JWTTestUtil.giveAValidJwtTokenDto();
  const query: QueryFilter = { take: 40, skip: 0 };
  const mockGroupService = createMock<GroupService>();
  const mockUserService = createMock<UserService>();
  let messageRepository: MessageRepository;

  beforeEach(async () => {
    messageRepository = new InMemoryMessageRepository([]);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        { provide: GroupService, useValue: mockGroupService },
        { provide: UserService, useValue: mockUserService },
        { provide: TypeormMessageRepository, useValue: messageRepository }
      ]
    }).compile();

    jest.resetAllMocks();
    sut = module.get<MessageService>(MessageService);
  });

  describe('When initilize the service', () => {
    it('should be defined', () => {
      expect(sut).toBeDefined();
    });
  });

  describe('When get user last messages', () => {
    it('should return user last contact messages', async () => {
      const user = UserBuilder.aUser().build();
      const contact = UserBuilder.aUser().newUsername().newId().build();
      const message = MessageBuilder.aMessage().build();
      await messageRepository.addContactMessage(contact, message.message, user);
      mockUserService.getByID.mockResolvedValueOnce(user);
      const result = await sut.userLastMessages(jwtDto);
      expect(result.length).toBe(1);
    });
  });

  describe('When get group messages', () => {
    it('should return group messages', async () => {
      const userA = UserBuilder.aUser().build();
      const userB = UserBuilder.aUser().newUsername().newId().build();
      const group = GroupBuilder.aGroup().build();
      const message = MessageBuilder.aMessage().build();
      await messageRepository.addGroupMessage(group, message.message, userA);
      await messageRepository.addGroupMessage(group, message.message, userB);
      mockGroupService.getByID.mockResolvedValueOnce(group);
      const result = await sut.getGroupMessages(group.id, jwtDto, query);
      expect(result.length).toBe(2);
    });
  });

  describe('When get last group message', () => {
    it('should return last group message', async () => {
      const userA = UserBuilder.aUser().build();
      const userB = UserBuilder.aUser().newUsername().newId().build();
      const group = GroupBuilder.aGroup().build();
      const message = MessageBuilder.aMessage().build();
      await messageRepository.addGroupMessage(group, message.message, userA);
      const lastMessage = await messageRepository.addGroupMessage(
        group,
        message.message,
        userB
      );
      mockGroupService.getByID.mockResolvedValueOnce(group);
      const result = await sut.lastGroupMessage(group.id, jwtDto);
      expect(result).toEqual(lastMessage);
    });
  });

  describe('When get contact messages', () => {
    it('should return contact messages', async () => {
      const user = UserBuilder.aUser().build();
      const contact = UserBuilder.aUser().newUsername().newId().build();
      const message = MessageBuilder.aMessage().build();
      await messageRepository.addContactMessage(contact, message.message, user);
      await messageRepository.addContactMessage(user, message.message, contact);
      await messageRepository.addContactMessage(contact, message.message, user);
      mockUserService.getByID.mockResolvedValueOnce(user);
      mockUserService.getByUsername.mockResolvedValueOnce(contact);
      const result = await sut.getContactMessages(
        jwtDto,
        contact.username,
        query
      );
      expect(result.length).toBe(3);
    });
  });

  describe('When post group message', () => {
    it('should create and return message', async () => {
      const user = UserBuilder.aUser().build();
      const group = GroupBuilder.aGroup().build();
      mockUserService.getByID.mockResolvedValueOnce(user);
      mockGroupService.getByID.mockResolvedValueOnce(group);
      const message: MessageDto = {
        destination: group.id,
        message: 'testing'
      };
      const result = await sut.postGroupMessage(jwtDto, message);
      expect(result).toHaveProperty('id');
      expect(result.message).toEqual('testing');
      expect(result.origin).toEqual(user);
      expect(result.groupDestination).toEqual(group);
      expect(
        (await messageRepository.findGroupMessages(group, query)).length
      ).toBe(1);
    });
  });

  describe('When post user message', () => {
    it('should create and return message', async () => {
      const userA = UserBuilder.aUser().build();
      const userB = UserBuilder.aUser().newUsername().newId().build();
      mockUserService.getByID.mockResolvedValueOnce(userA);
      mockUserService.getByUsername.mockResolvedValueOnce(userB);
      const message: MessageDto = {
        destination: userB.username,
        message: 'testing'
      };
      const result = await sut.postUserMessage(jwtDto, message);
      expect(result).toHaveProperty('id');
      expect(result.message).toEqual('testing');
      expect(result.origin).toEqual(userA);
      expect(result.userDestination).toEqual(userB);
      expect(
        (await messageRepository.findContactMessages(userA, userB, query))
          .length
      ).toBe(1);
    });
  });

  describe('When delete message', () => {
    const origin = UserBuilder.aUser().build();
    const destination = UserBuilder.aUser().newUsername().newId().build();
    let messageDb: Message;
    beforeEach(async () => {
      messageDb = await messageRepository.addContactMessage(
        destination,
        'testing',
        origin
      );
    });
    it('should delete the message', async () => {
      mockUserService.getByID.mockResolvedValueOnce(origin);
      const result = await sut.deleteMessage(jwtDto, messageDb.id);
      expect(result.deleted).toBeTruthy();
    });

    it('should throw forbidden exception with old message', async () => {
      mockUserService.getByID.mockResolvedValueOnce(origin);
      messageDb.createdAt.setMinutes(
        messageDb.createdAt.getMinutes() - MINUTES_TO_DELETE_MESSAGE - 1
      );
      const sutFunction = async () =>
        await sut.deleteMessage(jwtDto, messageDb.id);
      await expect(sutFunction()).rejects.toThrow(ForbiddenException);
    });

    it('should throw forbidden exception when user is not the origin', async () => {
      mockUserService.getByID.mockResolvedValueOnce(destination);
      const sutFunction = async () =>
        await sut.deleteMessage(jwtDto, messageDb.id);
      await expect(sutFunction()).rejects.toThrow(ForbiddenException);
    });
  });

  describe('When join group rooms', () => {
    test('should join every room', async () => {
      const socket = createMock<Socket>();
      const group = GroupBuilder.aGroup().build();
      const groups = [group, group, group];
      mockUserService.getUserGroups.mockResolvedValueOnce(groups);
      await sut.joinGroupsRooms(jwtDto.id, socket);
      expect(socket.join).toHaveBeenCalledTimes(3);
    });
  });
});
