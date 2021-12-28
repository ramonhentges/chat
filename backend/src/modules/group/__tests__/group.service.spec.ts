import { createMock } from '@golevelup/ts-jest';
import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import GroupBuilder from '@/__test__/builder/group-builder';
import JWTTestUtil from '@/__test__/builder/JwtTestUtil';
import UserBuilder from '@/__test__/builder/user-builder';
import { InMemoryGroupRepository } from '@/__test__/doubles/repositories/in-memory-group-repository';
import { TypeormGroupRepository } from '@/external/repositories/typeorm/typeorm-group-repository';
import { MessagesGateway } from '@/gateways/messages.gateway';
import { Group } from '@/models/group.model';
import { User } from '@/models/user.model';
import { UserService } from '@/modules/user/user.service';
import { GroupRepository } from '@/ports/group-repository';
import { GroupService } from '../group.service';

describe('GroupService', () => {
  let sut: GroupService;
  const mockUserService = createMock<UserService>();
  const mockMessageGateway = createMock<MessagesGateway>();
  const userToken = JWTTestUtil.giveAValidJwtTokenDto();
  let groupRepository: GroupRepository;
  beforeEach(async () => {
    groupRepository = new InMemoryGroupRepository([]);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupService,
        { provide: UserService, useValue: mockUserService },
        {
          provide: TypeormGroupRepository,
          useValue: groupRepository
        },
        { provide: MessagesGateway, useValue: mockMessageGateway }
      ]
    }).compile();
    sut = module.get<GroupService>(GroupService);
    jest.resetAllMocks();
  });

  describe('When initialize group service', () => {
    it('should be defined', () => {
      expect(sut).toBeDefined();
    });
  });

  describe('When get user groups', () => {
    it('should call and return get user groups from user service', async () => {
      const group = GroupBuilder.aGroup().build();
      mockUserService.getUserGroups.mockResolvedValueOnce([group]);
      const result = await sut.myGroups(userToken);
      expect(result).toStrictEqual([group]);
      expect(mockUserService.getUserGroups).toHaveBeenCalledTimes(1);
      expect(mockUserService.getUserGroups).toHaveBeenCalledWith(userToken.id);
    });
  });

  describe('When get group info by id', () => {
    it('should return group info', async () => {
      jest.spyOn(groupRepository, 'findOneByIdWithUsers');
      const group = GroupBuilder.aGroup().build();
      const user = UserBuilder.aUser().build();
      group.users = [user];
      const addedGroup = await groupRepository.add(group);
      const result = await sut.getByID(addedGroup.id, {
        id: user.id,
        username: user.username
      });
      expect(result).toEqual(addedGroup);
      expect(groupRepository.findOneByIdWithUsers).toHaveBeenCalledTimes(2);
    });
    it('should throw permission error', async () => {
      jest.spyOn(groupRepository, 'findOneByIdWithUsers');
      const group = GroupBuilder.aGroup().build();
      const user = UserBuilder.aUser().build();
      group.users = [user];
      const addedGroup = await groupRepository.add(group);
      const sutFunction = async () =>
        await sut.getByID(addedGroup.id, {
          id: 'invalid-id',
          username: user.username
        });
      await expect(sutFunction()).rejects.toThrow(ForbiddenException);
      expect(groupRepository.findOneByIdWithUsers).toHaveBeenCalledTimes(1);
    });
  });

  describe('When create group', () => {
    it('should return created group', async () => {
      jest.spyOn(groupRepository, 'add');
      const group = GroupBuilder.aGroup().build();
      const user = UserBuilder.aUser().build();
      mockUserService.getByID.mockResolvedValueOnce(user);
      const result = await sut.create(userToken, group);
      expect(result).toHaveProperty('id');
      expect(groupRepository.add).toHaveBeenCalledTimes(1);
      expect(mockMessageGateway.addUserToGroupRoom).toHaveBeenCalledTimes(1);
    });
  });

  describe('When update a group', () => {
    it('should return updated group', async () => {
      jest.spyOn(groupRepository, 'updateById');
      const group = GroupBuilder.aGroup().build();
      const user = UserBuilder.aUser().build();
      group.users = [user];
      const groupToUpdate = await groupRepository.add(group);
      const result = await sut.update(groupToUpdate.id, group, {
        id: user.id,
        username: user.username
      });
      expect(result).toEqual(groupToUpdate);
      expect(groupRepository.updateById).toHaveBeenCalledTimes(1);
    });
    it('should throw permission error', async () => {
      jest.spyOn(groupRepository, 'updateById');
      const group = GroupBuilder.aGroup().build();
      const user = UserBuilder.aUser().build();
      group.users = [user];
      const sutFunction = async () =>
        await sut.update(group.id, group, {
          id: 'invalidId',
          username: user.username
        });
      await expect(sutFunction()).rejects.toThrow(ForbiddenException);
      expect(groupRepository.updateById).toHaveBeenCalledTimes(0);
    });
  });

  describe('When add user', () => {
    it('should add user', async () => {
      jest.spyOn(groupRepository, 'addUser');
      const group = GroupBuilder.aGroup().build();
      const user = UserBuilder.aUser().build();
      group.users = [userToken as User];
      const groupToAddUser = await groupRepository.add(group);
      const result = await sut.addUser(
        {
          groupId: groupToAddUser.id,
          username: user.username
        },
        userToken
      );
      expect(result).toHaveProperty('id');
      expect(groupRepository.addUser).toHaveBeenCalledTimes(1);
    });

    it('should throw permission error', async () => {
      jest.spyOn(groupRepository, 'addUser');
      const group = GroupBuilder.aGroup().build();
      const user = UserBuilder.aUser().build();
      group.users = [user];
      const groupToAddUser = await groupRepository.add(group);
      const sutFunction = async () =>
        await sut.addUser(
          {
            groupId: groupToAddUser.id,
            username: user.username
          },
          { id: 'invalid', username: 'invalid' }
        );
      await expect(sutFunction()).rejects.toThrow(ForbiddenException);
      expect(groupRepository.addUser).toHaveBeenCalledTimes(0);
    });
  });

  describe('When remove user', () => {
    it('should remove user', async () => {
      jest.spyOn(groupRepository, 'removeUser');
      const group = GroupBuilder.aGroup().build();
      const user = UserBuilder.aUser().build();
      group.users = [userToken as User, user];
      const groupToRemoveUser = await groupRepository.add(group);
      mockUserService.getByUsername.mockResolvedValueOnce(user);
      const result = await sut.removeUser(
        {
          groupId: groupToRemoveUser.id,
          username: user.username
        },
        userToken
      );
      expect(result).toHaveProperty('id');
      expect(groupRepository.removeUser).toHaveBeenCalledTimes(1);
    });

    it('should throw permission error', async () => {
      jest.spyOn(groupRepository, 'removeUser');
      const group = GroupBuilder.aGroup().build();
      const user = UserBuilder.aUser().build();
      group.users = [user];
      const groupToRemoveUser = await groupRepository.add(group);
      const sutFunction = async () =>
        await sut.removeUser(
          {
            groupId: groupToRemoveUser.id,
            username: user.username
          },
          { id: 'invalid', username: 'invalid' }
        );
      await expect(sutFunction()).rejects.toThrow(ForbiddenException);
      expect(groupRepository.removeUser).toHaveBeenCalledTimes(0);
    });
  });

  describe('When delete group', () => {
    it('should delete the group', async () => {
      jest.spyOn(groupRepository, 'deleteById');
      const group = GroupBuilder.aGroup().build();
      group.users = [userToken as User];
      const groupToDelete = await groupRepository.add(group);
      const result = await sut.delete(groupToDelete.id, userToken);
      expect(result).toBe(undefined);
      expect(groupRepository.deleteById).toHaveBeenCalledTimes(1);
    });

    it('should throw permission error', async () => {
      jest.spyOn(groupRepository, 'deleteById');
      const group = GroupBuilder.aGroup().build();
      const user = UserBuilder.aUser().build();
      group.users = [user];
      const groupDelete = await groupRepository.add(group);
      const sutFunction = async () =>
        await sut.delete(groupDelete.id, {
          id: 'invalid',
          username: 'invalid'
        });
      await expect(sutFunction()).rejects.toThrow(ForbiddenException);
      expect(groupRepository.deleteById).toHaveBeenCalledTimes(0);
    });
  });
});
