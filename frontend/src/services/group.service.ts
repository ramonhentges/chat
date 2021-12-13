import { AddRemoveUserToGroupDto } from '../dto/add-user-to-group';
import { CreateGroupDto } from '../dto/create-group';

import { api } from './api';

export const createGroup = (group: CreateGroupDto) =>
  api({ url: `groups`, method: 'POST', data: group });

export const updateGroup = (groupId: string, group: CreateGroupDto) =>
  api({ url: `groups/${groupId}`, method: 'PUT', data: group });

export const addUser = (userGroup: AddRemoveUserToGroupDto) =>
  api({ url: `groups/add-user`, method: 'POST', data: userGroup });

export const removeUser = (userGroup: AddRemoveUserToGroupDto) =>
  api({
    url: `groups/remove-user/${userGroup.groupId}/${userGroup.username}`,
    method: 'DELETE'
  });

export const deleteGroup = (groupId: string) =>
  api({ url: `groups/${groupId}`, method: 'DELETE' });

export const getMyGroups = () => api({ url: 'groups', method: 'GET' });

export const getGroupInfo = (groupId: string) =>
  api({ url: `groups/${groupId}`, method: 'GET' });
