import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import UserBuilder from 'src/__test__/builder/user-builder';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';

describe('AuthController', () => {
  let sut: AuthController;
  const mockAuthService = createMock<AuthService>();

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }]
    }).compile();

    sut = module.get<AuthController>(AuthController);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('When initialize authController', () => {
    it('should be defined', () => {
      expect(sut).toBeDefined();
    });
  });

  describe('When call login function', () => {
    it('should call and return from login on authService', async () => {
      const accessToken = { accessToken: 'someToken' };
      const user = UserBuilder.aUser().build();
      const loginData = {username: user.username, password: '123456'}
      mockAuthService.login.mockResolvedValueOnce(accessToken);
      const result = await sut.login(loginData);
      expect(result).toStrictEqual(accessToken);
      expect(mockAuthService.login).toHaveBeenCalledTimes(1);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginData);
    });
  });
});
