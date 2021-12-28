import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { QueryFilter } from '@/global-dto/query';
import JWTTestUtil from '@/__test__/builder/JwtTestUtil';
import MessageBuilder from '@/__test__/builder/message-builder';
import { MessageService } from '../message.service';
import { UserMessageController } from '../user-message.controller';

describe('UserMessageController', () => {
  let sut: UserMessageController;
  const mockMessageService = createMock<MessageService>();
  const jwtDto = JWTTestUtil.giveAValidJwtTokenDto();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserMessageController],
      providers: [{ provide: MessageService, useValue: mockMessageService }]
    }).compile();

    sut = module.get<UserMessageController>(UserMessageController);
  });

  describe('When initialize the controller', () => {
    it('should be defined', () => {
      expect(sut).toBeDefined();
    });
  });

  describe('When call index function', () => {
    it('should call and return from getContactMessages service', async () => {
      const username = 'test';
      const query: QueryFilter = { take: 40, skip: 0 };
      const message = MessageBuilder.aMessage().build();
      mockMessageService.getContactMessages.mockResolvedValueOnce([message]);
      const result = await sut.index(username, jwtDto, query);
      expect(result).toStrictEqual([message]);
      expect(mockMessageService.getContactMessages).toHaveBeenCalledTimes(1);
      expect(mockMessageService.getContactMessages).toHaveBeenCalledWith(jwtDto, username, query);
    });
  });

  describe('When call lastMessages function', () => {
    it('should call and return from userLastMessages service', async () => {
      const message = MessageBuilder.aMessage().build();
      mockMessageService.userLastMessages.mockResolvedValueOnce([message]);
      const result = await sut.lastMessages(jwtDto);
      expect(result).toStrictEqual([message]);
      expect(mockMessageService.userLastMessages).toHaveBeenCalledTimes(1);
      expect(mockMessageService.userLastMessages).toHaveBeenCalledWith(jwtDto);
    });
  });
});
