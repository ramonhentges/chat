import { Group } from 'src/models/group.model';
import { User } from 'src/models/user.model';
import { CreateGroupData } from 'src/ports/create-group-data';
import { GroupRepository } from 'src/ports/group-repository';
import { UpdateGroupData } from 'src/ports/update-group-data';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Group)
export class TypeormGroupRepository
  extends Repository<Group>
  implements GroupRepository
{
  async isUserInGroup(userId: string, groupId: string): Promise<boolean> {
    const count = await this.createQueryBuilder('group')
      .leftJoinAndSelect('group.users', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('group.id = :groupId', { groupId })
      .getCount();
    return count > 0;
  }
  findOneByIdWithUsers(id: string): Promise<Group> {
    return this.findOne({ id }, { relations: ['users'] });
  }
  add(groupData: CreateGroupData): Promise<Group> {
    const group = this.create(groupData);
    return this.save(group);
  }
  async updateById(id: string, data: UpdateGroupData): Promise<Group> {
    await this.update({ id }, data);
    return this.findOne({ id });
  }
  async addUser(user: User, groupId: string): Promise<Group> {
    const group = await this.findOneOrFail({
      where: { id: groupId },
      relations: ['users']
    });
    group.users.push(user);
    await this.save(group);
    const returnedGroup = await this.findOne({
      where: { id: groupId }
    });
    return returnedGroup;
  }
  async removeUser(user: User, groupId: string): Promise<Group> {
    const group = await this.findOneOrFail({
      where: { id: groupId },
      relations: ['users']
    });

    group.users = group.users.filter(
      (userArr) => userArr.username !== user.username
    );
    await this.save(group);
    const returnedGroup = await this.findOne({
      where: { id: groupId }
    });
    return returnedGroup;
  }
  async deleteById(id: string): Promise<void> {
    await this.delete({ id });
  }
}
