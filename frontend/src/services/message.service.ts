import { User } from '../models/user';
import { api } from './api';

const getLatestMessages = () => api.get(`user-message/last/messages`);

const getUserMessages = (destination: User) =>
  api.get(`user-message/${destination.username}`);

export { getLatestMessages, getUserMessages };
