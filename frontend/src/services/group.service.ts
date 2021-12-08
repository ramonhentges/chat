import { AddRemoveUserToGroup } from '../interfaces/add-user-to-group';
import { ICreateGroup } from '../interfaces/create-group';

import { api } from './api';

export const createGroup = (group: ICreateGroup) =>
  api({ url: `groups`, method: 'POST', data: group });

export const updateGroup = (groupId: string, group: ICreateGroup) =>
  api({ url: `groups/${groupId}`, method: 'PUT', data: group });

export const addUser = (userGroup: AddRemoveUserToGroup) =>
  api({ url: `groups/add-user`, method: 'POST', data: userGroup });

export const removeUser = (userGroup: AddRemoveUserToGroup) =>
  api({
    url: `groups/remove-user/${userGroup.groupId}/${userGroup.username}`,
    method: 'DELETE'
  });

export const deleteGroup = (groupId: string) =>
  api({ url: `groups/${groupId}`, method: 'DELETE' });

export const getMyGroups = () => api({ url: 'groups', method: 'GET' });

export const getGroupInfo = (groupId: string) =>
  api({ url: `groups/${groupId}`, method: 'GET' });
