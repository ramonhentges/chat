import { Group } from '@/models/group.model';
import { User } from '@/models/user.model';
import { CreateGroupData } from './create-group-data';
import { UpdateGroupData } from './update-group-data';

export interface GroupRepository {
  findOneByIdWithUsers(id: string): Promise<Group>;
  add(group: CreateGroupData): Promise<Group>;
  updateById(id: string, data: UpdateGroupData): Promise<Group>;
  addUser(user: User, groupId: string): Promise<Group>;
  removeUser(user: User, groupId: string): Promise<Group>;
  deleteById(id: string): Promise<void>;
  isUserInGroup(userId: string, groupId: string): Promise<boolean>;
}
