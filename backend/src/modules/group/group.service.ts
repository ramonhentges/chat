import {
  ForbiddenException,
  Injectable,
  Inject,
  forwardRef
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AddRemoveUserToGroupDto } from './dto/add-user-to-group.dto';
import { GroupDto } from './dto/group.dto';
import { JwsTokenDto } from '../auth/dto/jws-token.dto';
import { MessagesGateway } from 'src/gateways/messages.gateway';
import { UserService } from '../user/user.service';
import { TypeormGroupRepository } from 'src/external/repositories/typeorm/typeorm-group-repository';
import { GroupRepository } from 'src/ports/group-repository';
import { CreateGroupData } from 'src/ports/create-group-data';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(TypeormGroupRepository)
    private groupRepo: GroupRepository,
    private userService: UserService,
    @Inject(forwardRef(() => MessagesGateway))
    private messageGateway: MessagesGateway
  ) { }

  async myGroups(user: JwsTokenDto) {
    return this.userService.getUserGroups(user.id);
  }

  async getByID(id: string, user: JwsTokenDto) {
    const userInGroup = await this.isUserInGroup(user.id, id);
    if (userInGroup) {
      return await this.groupRepo.findOneByIdWithUsers(id);
    }
    throw new ForbiddenException({
      message: 'Você não possui permissão para visualizar este grupo'
    });
  }

  async create(createUser: JwsTokenDto, groupDto: GroupDto) {
    const user = await this.userService.getByID(createUser.id);
    const group: CreateGroupData = {
      name: groupDto.name,
      description: groupDto.description,
      users: [user]
    };
    const savedGroup = await this.groupRepo.add(group);
    this.messageGateway.addUserToGroupRoom(user.id, savedGroup);
    return savedGroup;
  }

  async update(id: string, groupDto: GroupDto, user: JwsTokenDto) {
    const userInGroup = await this.isUserInGroup(user.id, id);
    if (userInGroup) {
      return this.groupRepo.updateById(id, groupDto);
    }
    throw new ForbiddenException({
      message: 'Você não possui permissão para alterar este grupo'
    });
  }

  async addUser(addUserDto: AddRemoveUserToGroupDto, user: JwsTokenDto) {
    const userInGroup = await this.isUserInGroup(user.id, addUserDto.groupId);
    if (userInGroup) {
      const userToAdd = await this.userService.getByUsername(
        addUserDto.username
      );
      const group = await this.groupRepo.addUser(userToAdd, addUserDto.groupId);
      this.messageGateway.addUserToGroupRoom(userToAdd.id, group);
      return group;
    }
    throw new ForbiddenException({
      message: 'Você não possui permissão para alterar este grupo'
    });
  }

  async removeUser(removeUserDto: AddRemoveUserToGroupDto, user: JwsTokenDto) {
    const userInGroup = await this.isUserInGroup(user.id, removeUserDto.groupId);
    if (userInGroup) {
      const userToRemove = await this.userService.getByUsername(
        removeUserDto.username
      );
      const group = await this.groupRepo.removeUser(
        userToRemove,
        removeUserDto.groupId
      );
      this.messageGateway.removeUserFromGroupRoom(userToRemove.id, group);
      return group;
    }
    throw new ForbiddenException({
      message: 'Você não possui permissão para alterar este grupo'
    });
  }

  async delete(id: string, user: JwsTokenDto) {
    const userInGroup = await this.isUserInGroup(user.id, id);

    if (userInGroup) {
      this.groupRepo.deleteById(id);
      return;
    }
    throw new ForbiddenException({
      message: 'Você não possui permissão para deletar este grupo'
    });
  }

  async isUserInGroup(userId: string, groupId: string) {
    return await this.groupRepo.isUserInGroup(userId, groupId);
  }
}
