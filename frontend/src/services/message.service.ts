import { User } from '../models/user';
import { api } from './api';

export const getLatestMessages = () => api.get(`user-message/last/messages`);

export const getUserMessages = (destination: User) =>
  api.get(`user-message/${destination.username}`);

export const getLastGroupMessage = (groupId: string) =>
  api({ url: `group-message/last/${groupId}`, method: 'GET' });

export const getGroupMessages = (groupId: string) =>
  api({ url: `group-message/${groupId}`, method: 'GET' });
