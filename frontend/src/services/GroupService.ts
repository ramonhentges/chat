import { AddRemoveUserToGroupDto } from '../dto/add-user-to-group';
import { CreateGroupDto } from '../dto/create-group';
import { HttpResponse } from '../types/HttpResponse';

export interface GroupService {
  createGroup(group: CreateGroupDto): Promise<HttpResponse>;

  updateGroup(groupId: string, group: CreateGroupDto): Promise<HttpResponse>;

  addUser(userGroup: AddRemoveUserToGroupDto): Promise<HttpResponse>;

  removeUser(userGroup: AddRemoveUserToGroupDto): Promise<HttpResponse>;

  deleteGroup(groupId: string): Promise<HttpResponse>;

  getMyGroups(): Promise<HttpResponse>;

  getGroupInfo(groupId: string): Promise<HttpResponse>;
}
