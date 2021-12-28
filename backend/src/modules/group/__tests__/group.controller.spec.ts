import { Test, TestingModule } from '@nestjs/testing';
import { GroupController } from '../group.controller';
import { createMock } from '@golevelup/ts-jest';
import { GroupService } from '../group.service';
import JWTTestUtil from '@/__test__/builder/JwtTestUtil';
import GroupBuilder from '@/__test__/builder/group-builder';
import { AddRemoveUserToGroupDto } from '../dto/add-user-to-group.dto';
import UserBuilder from '@/__test__/builder/user-builder';

describe('GroupController', () => {
  let sut: GroupController;
  const mockGroupService = createMock<GroupService>();
  const jwtDto = JWTTestUtil.giveAValidJwtTokenDto();

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupController],
      providers: [{ provide: GroupService, useValue: mockGroupService }]
    }).compile();

    sut = module.get<GroupController>(GroupController);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('When initialize', () => {
    it('should be defined', () => {
      expect(sut).toBeDefined();
    });
  });

  describe('When get user groups', () => {
    it('should call and return value from myGroups service function', async () => {
      const group = GroupBuilder.aGroup().build();
      mockGroupService.myGroups.mockResolvedValueOnce([group]);
      const result = await sut.index(jwtDto);
      expect(result).toStrictEqual([group]);
      expect(mockGroupService.myGroups).toHaveBeenCalledTimes(1);
      expect(mockGroupService.myGroups).toHaveBeenCalledWith(jwtDto);
    });
  });

  describe('When get group info', () => {
    it('should call and return value from get by id service function', async () => {
      const group = GroupBuilder.aGroup().build();
      mockGroupService.getByID.mockResolvedValueOnce(group);
      const result = await sut.show(group.id, jwtDto);
      expect(result).toStrictEqual(group);
      expect(mockGroupService.getByID).toHaveBeenCalledTimes(1);
      expect(mockGroupService.getByID).toHaveBeenCalledWith(group.id, jwtDto);
    });
  });

  describe('When store a new group', () => {
    it('should call and return value from create service funcion', async () => {
      const group = GroupBuilder.aGroup().build();
      mockGroupService.create.mockResolvedValueOnce(group);
      const result = await sut.store(group, jwtDto);
      expect(result).toStrictEqual(group);
      expect(mockGroupService.create).toHaveBeenCalledTimes(1);
      expect(mockGroupService.create).toHaveBeenCalledWith(jwtDto, group);
    });
  });

  describe('When add user to group', () => {
    it('should call and return value from add user service funcion', async () => {
      const group = GroupBuilder.aGroup().build();
      const user = UserBuilder.aUser().build();
      mockGroupService.addUser.mockResolvedValueOnce(group);
      const body: AddRemoveUserToGroupDto = {
        groupId: group.id,
        username: user.username
      };
      const result = await sut.addUser(body, jwtDto);
      expect(result).toStrictEqual(group);
      expect(mockGroupService.addUser).toHaveBeenCalledTimes(1);
      expect(mockGroupService.addUser).toHaveBeenCalledWith(body, jwtDto);
    });
  });

  describe('When remove user from group', () => {
    it('should call remove user service funcion', async () => {
      const group = GroupBuilder.aGroup().build();
      const user = UserBuilder.aUser().build();
      mockGroupService.removeUser.mockResolvedValueOnce(group);
      const result = await sut.removeUser(jwtDto, group.id, user.username);
      expect(result).toStrictEqual(undefined);
      expect(mockGroupService.removeUser).toHaveBeenCalledTimes(1);
      expect(mockGroupService.removeUser).toHaveBeenCalledWith(
        { username: user.username, groupId: group.id },
        jwtDto
      );
    });
  });

  describe('When update a group', () => {
    it('should call and return update service funcion', async () => {
      const group = GroupBuilder.aGroup().build();
      mockGroupService.update.mockResolvedValueOnce(group);
      const result = await sut.update(group.id, group, jwtDto);
      expect(result).toStrictEqual(group);
      expect(mockGroupService.update).toHaveBeenCalledTimes(1);
      expect(mockGroupService.update).toHaveBeenCalledWith(
        group.id,
        group,
        jwtDto
      );
    });
  });

  describe('When delete a group', () => {
    it('should call delete service funcion', async () => {
      const group = GroupBuilder.aGroup().build();
      mockGroupService.delete.mockResolvedValueOnce(undefined);
      const result = await sut.delete(group.id, jwtDto);
      expect(result).toStrictEqual(undefined);
      expect(mockGroupService.delete).toHaveBeenCalledTimes(1);
      expect(mockGroupService.delete).toHaveBeenCalledWith(group.id, jwtDto);
    });
  });
});
