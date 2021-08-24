import { Test, TestingModule } from '@nestjs/testing';
import { UserMessageController } from './user-message.controller';

describe('UserMessageController', () => {
  let controller: UserMessageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserMessageController]
    }).compile();

    controller = module.get<UserMessageController>(UserMessageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
