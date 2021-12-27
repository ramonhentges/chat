import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { QueryFilter } from 'src/global-dto/query';
import JWTTestUtil from 'src/__test__/builder/JwtTestUtil';
import MessageBuilder from 'src/__test__/builder/message-builder';
import { GroupMessageController } from '../group-message.controller';
import { MessageService } from '../message.service';

describe('GroupMessageController', () => {
  let sut: GroupMessageController;
  const jwtDto = JWTTestUtil.giveAValidJwtTokenDto();
  const mockMessageService = createMock<MessageService>();

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupMessageController],
      providers: [{ provide: MessageService, useValue: mockMessageService }]
    }).compile();

    sut = module.get<GroupMessageController>(GroupMessageController);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('When initilize controller', () => {
    it('should be defined', () => {
      expect(sut).toBeDefined();
    });
  });

  describe('When call index function', () => {
    it('should call and return from getGroupMessages service', async () => {
      const message = MessageBuilder.aMessage().build();
      const groupId = '123';
      const query: QueryFilter = { take: 40, skip: 10 };
      mockMessageService.getGroupMessages.mockResolvedValueOnce([message]);
      const result = await sut.index(groupId, jwtDto, query);
      expect(result).toStrictEqual([message]);
      expect(mockMessageService.getGroupMessages).toHaveBeenCalledTimes(1);
      expect(mockMessageService.getGroupMessages).toHaveBeenLastCalledWith(
        groupId,
        jwtDto,
        query
      );
    });
  });

  describe('When call last function', () => {
    it('should call and return from lastGroupMessage service', async () => {
      const message = MessageBuilder.aMessage().build();
      const groupId = '123';
      mockMessageService.lastGroupMessage.mockResolvedValueOnce(message);
      const result = await sut.last(groupId, jwtDto);
      expect(result).toStrictEqual(message);
      expect(mockMessageService.lastGroupMessage).toHaveBeenCalledTimes(1);
      expect(mockMessageService.lastGroupMessage).toHaveBeenLastCalledWith(
        groupId,
        jwtDto
      );
    });
  });
});
