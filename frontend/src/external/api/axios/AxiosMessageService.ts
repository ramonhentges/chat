import { injectable } from 'inversify';
import { QueryFilter } from '../../../interfaces/query';
import { User } from '../../../models/user';
import { api } from '../../../services/api';
import { MessageService } from '../../../services/MessageService';

@injectable()
export class AxiosMessageService implements MessageService {
  getLatestMessages = () => api.get(`user-message/last/messages`);

  getUserMessages = (destination: User, query: QueryFilter) =>
    api.get(
      `user-message/${destination.username}?take=${query.take}&skip=${query.skip}`
    );

  getLastGroupMessage = (groupId: string) =>
    api({ url: `group-message/last/${groupId}`, method: 'GET' });

  getGroupMessages = (groupId: string, query: QueryFilter) =>
    api({
      url: `group-message/${groupId}?take=${query.take}&skip=${query.skip}`,
      method: 'GET'
    });
}
