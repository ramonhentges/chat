import {
  ForbiddenException,
  Injectable,
  Inject,
  forwardRef
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AddRemoveUserToGroupDto } from 'src/dto/add-user-to-group.dto';
import { GroupDto } from 'src/dto/group.dto';
import { JwsTokenDto } from 'src/dto/jws-token.dto';
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
    return this.userService.getUserGroups(user.uuid);
  }

  async getByUUID(uuid: string, user: JwsTokenDto) {
    const userInGroup = await this.isUserInGroup(user.uuid, uuid);

    if (userInGroup) {
      return await this.groupRepo.findOne({ uuid });
    }
    throw new ForbiddenException({
      message: 'Você não possui permissão para visualizar este grupo'
    });
  }

  async create(createUser: JwsTokenDto, groupDto: GroupDto) {
    const group = this.groupRepo.create(groupDto);
    const user = await this.userService.getByUUID(createUser.uuid);
    group.users = [user];
    return this.groupRepo.save(group);
  }

  async update(uuid: string, groupDto: GroupDto, user: JwsTokenDto) {
    const userInGroup = await this.isUserInGroup(user.uuid, uuid);

    if (userInGroup) {
      this.groupRepo.update({ uuid }, groupDto);
      return await this.groupRepo.findOne({ uuid });
    }
    throw new ForbiddenException({
      message: 'Você não possui permissão para alterar este grupo'
    });
  }

  async addUser(addUserDto: AddRemoveUserToGroupDto, user: JwsTokenDto) {
    const userInGroup = await this.isUserInGroup(
      user.uuid,
      addUserDto.groupUuid
    );

    if (userInGroup) {
      const userToAdd = await this.userService.getByUsername(
        addUserDto.username
      );
      const group = await this.groupRepo.findOneOrFail({
        where: { uuid: addUserDto.groupUuid },
        relations: ['users']
      });
      group.users.push(userToAdd);
      await this.groupRepo.save(group);
      this.messageGateway.addUserToGroupRoom(userToAdd.uuid, group.uuid);
      return await this.groupRepo.findOne({
        where: { uuid: addUserDto.groupUuid }
      });
    }
    throw new ForbiddenException({
      message: 'Você não possui permissão para alterar este grupo'
    });
  }

  async removeUser(removeUser: AddRemoveUserToGroupDto, user: JwsTokenDto) {
    const userInGroup = await this.isUserInGroup(
      user.uuid,
      removeUser.groupUuid
    );

    if (userInGroup) {
      const userToRemove = await this.userService.getByUsername(
        removeUser.username
      );
      const group = await this.groupRepo.findOneOrFail({
        where: { uuid: removeUser.groupUuid },
        relations: ['users']
      });

      group.users = group.users.filter(
        (user) => user.username !== userToRemove.username
      );
      await this.groupRepo.save(group);
      this.messageGateway.removeUserFromGroupRoom(
        userToRemove.uuid,
        group.uuid
      );
      return await this.groupRepo.findOne({
        where: { uuid: removeUser.groupUuid }
      });
    }
    throw new ForbiddenException({
      message: 'Você não possui permissão para alterar este grupo'
    });
  }

  async delete(uuid: string, user: JwsTokenDto) {
    const userInGroup = await this.isUserInGroup(user.uuid, uuid);

    if (userInGroup) {
      this.groupRepo.delete({ uuid });
      return;
    }
    throw new ForbiddenException({
      message: 'Você não possui permissão para deletar este grupo'
    });
  }

  async isUserInGroup(userUuid: string, groupUuid: string) {
    return (
      (await this.groupRepo
        .createQueryBuilder('group')
        .leftJoinAndSelect('group.users', 'user')
        .where('user.uuid = :userUuid', { userUuid })
        .andWhere('group.uuid = :groupUuid', { groupUuid })
        .getCount()) > 0
    );
  }
}
