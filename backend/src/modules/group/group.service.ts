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
import { Group } from 'src/models/group.model';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private groupRepo: Repository<Group>,
    private userService: UserService,
    @Inject(forwardRef(() => MessagesGateway))
    private messageGateway: MessagesGateway
  ) {}

  async myGroups(user: JwsTokenDto) {
    return this.userService.getUserGroups(user.id);
  }

  async getByID(id: string, user: JwsTokenDto) {
    const userInGroup = await this.isUserInGroup(user.id, id);
    if (userInGroup) {
      return await this.groupRepo.findOne({ id }, { relations: ['users'] });
    }
    throw new ForbiddenException({
      message: 'Você não possui permissão para visualizar este grupo'
    });
  }

  async create(createUser: JwsTokenDto, groupDto: GroupDto) {
    const group = this.groupRepo.create(groupDto);
    const user = await this.userService.getByID(createUser.id);
    group.users = [user];
    return this.groupRepo.save(group);
  }

  async update(id: string, groupDto: GroupDto, user: JwsTokenDto) {
    const userInGroup = await this.isUserInGroup(user.id, id);

    if (userInGroup) {
      this.groupRepo.update({ id }, groupDto);
      return await this.groupRepo.findOne({ id });
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
      const group = await this.groupRepo.findOneOrFail({
        where: { id: addUserDto.groupId },
        relations: ['users']
      });
      group.users.push(userToAdd);
      await this.groupRepo.save(group);
      this.messageGateway.addUserToGroupRoom(userToAdd.id, group.id);
      return await this.groupRepo.findOne({
        where: { id: addUserDto.groupId }
      });
    }
    throw new ForbiddenException({
      message: 'Você não possui permissão para alterar este grupo'
    });
  }

  async removeUser(removeUser: AddRemoveUserToGroupDto, user: JwsTokenDto) {
    const userInGroup = await this.isUserInGroup(user.id, removeUser.groupId);

    if (userInGroup) {
      const userToRemove = await this.userService.getByUsername(
        removeUser.username
      );
      const group = await this.groupRepo.findOneOrFail({
        where: { uuid: removeUser.groupId },
        relations: ['users']
      });

      group.users = group.users.filter(
        (user) => user.username !== userToRemove.username
      );
      await this.groupRepo.save(group);
      this.messageGateway.removeUserFromGroupRoom(userToRemove.id, group.id);
      return await this.groupRepo.findOne({
        where: { id: removeUser.groupId }
      });
    }
    throw new ForbiddenException({
      message: 'Você não possui permissão para alterar este grupo'
    });
  }

  async delete(id: string, user: JwsTokenDto) {
    const userInGroup = await this.isUserInGroup(user.id, id);

    if (userInGroup) {
      this.groupRepo.delete({ id });
      return;
    }
    throw new ForbiddenException({
      message: 'Você não possui permissão para deletar este grupo'
    });
  }

  async isUserInGroup(userId: string, groupId: string) {
    return (
      (await this.groupRepo
        .createQueryBuilder('group')
        .leftJoinAndSelect('group.users', 'user')
        .where('user.id = :userId', { userId })
        .andWhere('group.id = :groupId', { groupId })
        .getCount()) > 0
    );
  }
}
