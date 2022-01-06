import { Group } from '@/models/group.model';
import { User } from '@/models/user.model';
import { CreateGroupData } from '@/ports/create-group-data';
import { GroupRepository } from '@/ports/group-repository';
import { UpdateGroupData } from '@/ports/update-group-data';

export class InMemoryGroupRepository implements GroupRepository {
  private readonly _data: Group[];
  private idcounter: number = 0;
  private get data() {
    return this._data;
  }
  constructor(data: Group[]) {
    this._data = data;
  }

  async findOneByIdWithUsers(id: string): Promise<Group> {
    return this.data.find((group) => group.id === id);
  }

  async add(group: CreateGroupData): Promise<Group> {
    const groupClass = new Group();
    groupClass.id = this.idcounter.toString();
    groupClass.description = group.description;
    groupClass.name = group.name;
    groupClass.users = group.users;
    groupClass.createdAt = new Date();
    this.idcounter++;
    this._data.push(groupClass);
    return groupClass;
  }

  async updateById(id: string, data: UpdateGroupData): Promise<Group> {
    const originalGroup = await this.findOneByIdWithUsers(id);
    originalGroup.name = data.name;
    originalGroup.description = data.description;
    return originalGroup;
  }

  async addUser(user: User, groupId: string): Promise<Group> {
    const originalGroup = await this.findOneByIdWithUsers(groupId);
    originalGroup.users.push(user);
    return originalGroup;
  }

  async removeUser(user: User, groupId: string): Promise<Group> {
    const originalGroup = await this.findOneByIdWithUsers(groupId);
    originalGroup.users = originalGroup.users.filter(
      (value) => value.id !== user.id
    );
    return originalGroup;
  }

  async deleteById(id: string): Promise<void> {
    this._data.splice(
      this.data.findIndex((value) => value.id === id),
      1
    );
  }

  async isUserInGroup(userId: string, groupId: string): Promise<boolean> {
    const group = await this.findOneByIdWithUsers(groupId);
    if (group) {
      return group.users.some((user) => user.id === userId);
    } else {
      return false;
    }
  }
}
