import { injectable } from 'inversify';
import { AddRemoveUserToGroupDto } from '../../../dto/add-user-to-group';
import { CreateGroupDto } from '../../../dto/create-group';
import { api } from '../../../services/api';
import { GroupService } from '../../../services/GroupService';

@injectable()
export class AxiosGroupService implements GroupService {
  createGroup = (group: CreateGroupDto) =>
    api({ url: `groups`, method: 'POST', data: group });

  updateGroup = (groupId: string, group: CreateGroupDto) =>
    api({ url: `groups/${groupId}`, method: 'PUT', data: group });

  addUser = (userGroup: AddRemoveUserToGroupDto) =>
    api({ url: `groups/add-user`, method: 'POST', data: userGroup });

  removeUser = (userGroup: AddRemoveUserToGroupDto) =>
    api({
      url: `groups/remove-user/${userGroup.groupId}/${userGroup.username}`,
      method: 'DELETE'
    });

  deleteGroup = (groupId: string) =>
    api({ url: `groups/${groupId}`, method: 'DELETE' });

  getMyGroups = () => api({ url: 'groups', method: 'GET' });

  getGroupInfo = (groupId: string) =>
    api({ url: `groups/${groupId}`, method: 'GET' });
}
