import {
  NotFoundException,
  UnprocessableEntityException
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeormUserRepository } from '@/external/repositories/typeorm/typeorm-user-repository';
import { UserRepository } from '@/ports/user-repository';
import UserBuilder from '@/__test__/builder/user-builder';
import { DoubleEncoder } from '@/__test__/doubles/encoder';
import { InMemoryUserRepository } from '@/__test__/doubles/repositories/in-memory-user-repository';
import { UserService } from '../user.service';

describe('UserService', () => {
  let sut: UserService;
  let userRepository: UserRepository;

  beforeEach(async () => {
    userRepository = new InMemoryUserRepository([]);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: TypeormUserRepository, useValue: userRepository },
        { provide: 'ENCODER', useClass: DoubleEncoder }
      ]
    }).compile();

    sut = module.get<UserService>(UserService);
    jest.resetAllMocks();
  });

  describe('When initialize UserService', () => {
    it('should be defined', () => {
      expect(sut).toBeDefined();
    });
  });

  describe('When get all users', () => {
    it('should return all users', async () => {
      jest.spyOn(userRepository, 'findAll');
      const user = UserBuilder.aUser().build();
      await userRepository.add(user);
      const result = await sut.listAll();
      expect(result.length).toBe(1);
      expect(userRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('When get user by id', () => {
    it('should return the user', async () => {
      const user = UserBuilder.aUser().build();
      const userInRepo = await userRepository.add(user);
      const result = await sut.getByID(userInRepo.id);
      expect(result).toStrictEqual(userInRepo);
    });
    it('should throw user not found error', async () => {
      const user = UserBuilder.aUser().build();
      await userRepository.add(user);
      const sutFunction = async () => {
        await sut.getByID('invalid-id');
      };
      await expect(sutFunction()).rejects.toThrow(NotFoundException);
    });
  });

  describe('When get user by id without id', () => {
    it('should return the user without id', async () => {
      const user = UserBuilder.aUser().build();
      const userInRepo = await userRepository.add(user);
      const result = await sut.getByIDWithoutID(userInRepo.id);
      expect(result).not.toHaveProperty('id');
      expect(result).toHaveProperty('username');
    });
    it('should throw user not found error', async () => {
      const user = UserBuilder.aUser().build();
      await userRepository.add(user);
      const sutFunction = async () => {
        await sut.getByIDWithoutID('invalid-id');
      };
      await expect(sutFunction()).rejects.toThrow(NotFoundException);
    });
  });

  describe('When get user by username', () => {
    it('should return the user', async () => {
      const user = UserBuilder.aUser().build();
      const userInRepo = await userRepository.add(user);
      const result = await sut.getByUsername(userInRepo.username);
      expect(result).toStrictEqual(userInRepo);
    });
    it('should throw user not found error', async () => {
      const user = UserBuilder.aUser().build();
      await userRepository.add(user);
      const sutFunction = async () => {
        await sut.getByUsername('invalid-username');
      };
      await expect(sutFunction()).rejects.toThrow(NotFoundException);
    });
  });

  describe('When get user by username without id', () => {
    it('should return the user without id', async () => {
      const user = UserBuilder.aUser().build();
      const userInRepo = await userRepository.add(user);
      const result = await sut.getByUsernameWithoutID(userInRepo.username);
      expect(result).not.toHaveProperty('id');
      expect(result).toHaveProperty('username');
    });
    it('should throw user not found error', async () => {
      const user = UserBuilder.aUser().build();
      await userRepository.add(user);
      const sutFunction = async () => {
        await sut.getByUsernameWithoutID('invalid-username');
      };
      await expect(sutFunction()).rejects.toThrow(NotFoundException);
    });
  });

  describe('When get user groups by id', () => {
    it('should return the groups', async () => {
      const user = UserBuilder.aUser().build();
      const userInRepo = await userRepository.add(user);
      const result = await sut.getUserGroups(userInRepo.id);
      expect(result).toStrictEqual(userInRepo.groups);
    });
    it('should throw user not found error', async () => {
      const user = UserBuilder.aUser().build();
      await userRepository.add(user);
      const sutFunction = async () => {
        await sut.getUserGroups('invalid-id');
      };
      await expect(sutFunction()).rejects.toThrow(NotFoundException);
    });
  });

  describe('When create a new user', () => {
    it('should return created user', async () => {
      const user = UserBuilder.aUser().build();
      const result = await sut.store(user);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('username', user.username);
      expect(result).toHaveProperty('fullName', user.fullName);
    });

    it('should return that the user already exists', async () => {
      const user = UserBuilder.aUser().build();
      await userRepository.add(user);
      const sutFunction = async () => await sut.store(user);
      await expect(sutFunction()).rejects.toThrow(UnprocessableEntityException);
    });
  });

  describe('When update a user', () => {
    it('should return updated user changing password', async () => {
      const user = UserBuilder.aUser().build();
      const { id, username, fullName } = await userRepository.add(user);
      const updateData = {
        username,
        fullName,
        password: `changed-${user.password}`
      };
      const result = await sut.update({ id, username }, updateData);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('username', user.username);
      expect(result).toHaveProperty('fullName', user.fullName);
      expect(result.password).not.toEqual(user.password);
    });

    it('should return updated user without changing password', async () => {
      const user = UserBuilder.aUser().build();
      const { id, username, fullName } = await userRepository.add(user);
      const updateData = { username, fullName };
      const result = await sut.update({ id, username }, updateData);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('username', user.username);
      expect(result).toHaveProperty('fullName', user.fullName);
      expect(result.password).toEqual(user.password);
    });
  });

  describe('When login', () => {
    it('should return the user', async () => {
      const user = UserBuilder.aUser().build();
      await userRepository.add(user);
      const result = await sut.login(user.username, '12345678');
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('username', user.username);
      expect(result).toHaveProperty('fullName', user.fullName);
    });

    it('should return udefined', async () => {
      const user = UserBuilder.aUser().build();
      const result = await sut.login(user.username, '12345678');
      expect(result).toBeUndefined();
    });
  });
});
