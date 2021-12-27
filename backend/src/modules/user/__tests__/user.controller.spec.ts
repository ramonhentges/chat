import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import JWTTestUtil from 'src/__test__/builder/JwtTestUtil';
import UserBuilder from 'src/__test__/builder/user-builder';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';

describe('UserController', () => {
  let sut: UserController;
  let mockUserService = createMock<UserService>();
  const jwtDto = JWTTestUtil.giveAValidJwtTokenDto();

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }]
    }).compile();

    sut = module.get<UserController>(UserController);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('When initialize the controller', () => {
    it('should be defined', () => {
      expect(sut).toBeDefined();
    });
  });

  describe('When call index function', () => {
    it('should call and return values from listAll service', async () => {
      const user = UserBuilder.aUser().build();
      const users = [user];
      mockUserService.listAll.mockResolvedValueOnce(users);
      const result = await sut.index();
      expect(result).toStrictEqual(users);
      expect(mockUserService.listAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('When call myUser function', () => {
    it('should call and return from getByIDWithoutID service logged user info', async () => {
      const user = UserBuilder.aUser().build();
      mockUserService.getByIDWithoutID.mockResolvedValueOnce(user);
      const result = await sut.myUser(jwtDto);
      expect(result).toStrictEqual(user);
      expect(mockUserService.getByIDWithoutID).toHaveBeenCalledTimes(1);
      expect(mockUserService.getByIDWithoutID).toHaveBeenCalledWith(jwtDto.id);
    });
  });

  describe('When call show function', () => {
    it('should call and return user info by username from getByUsernameWithoutID service', async () => {
      const user = UserBuilder.aUser().build();
      mockUserService.getByUsernameWithoutID.mockResolvedValueOnce(user);
      const result = await sut.show(user.username);
      expect(result).toStrictEqual(user);
      expect(mockUserService.getByUsernameWithoutID).toHaveBeenCalledTimes(1);
      expect(mockUserService.getByUsernameWithoutID).toHaveBeenCalledWith(
        user.username
      );
    });
  });

  describe('When call store function', () => {
    it('should call and return user from store service', async () => {
      const user = UserBuilder.aUser().build();
      mockUserService.store.mockResolvedValueOnce(user);
      const result = await sut.store(user);
      expect(result).toStrictEqual(user);
      expect(mockUserService.store).toHaveBeenCalledTimes(1);
      expect(mockUserService.store).toHaveBeenCalledWith(user);
    });
  });

  describe('When call update function', () => {
    it('should call and return user from update service', async () => {
      const user = UserBuilder.aUser().build();
      mockUserService.update.mockResolvedValueOnce(user);
      const result = await sut.update(jwtDto, user);
      expect(result).toStrictEqual(user);
      expect(mockUserService.update).toHaveBeenCalledTimes(1);
      expect(mockUserService.update).toHaveBeenCalledWith(jwtDto, user);
    });
  });
});
