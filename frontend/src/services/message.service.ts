import { QueryFilter } from '../interfaces/query';
import { User } from '../models/user';
import { api } from './api';

export const getLatestMessages = () => api.get(`user-message/last/messages`);

export const getUserMessages = (destination: User, query: QueryFilter) =>
  api.get(
    `user-message/${destination.username}?take=${query.take}&skip=${query.skip}`
  );

export const getLastGroupMessage = (groupId: string) =>
  api({ url: `group-message/last/${groupId}`, method: 'GET' });

export const getGroupMessages = (groupId: string, query: QueryFilter) =>
  api({
    url: `group-message/${groupId}?take=${query.take}&skip=${query.skip}`,
    method: 'GET'
  });
