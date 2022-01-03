import { inject, injectable } from 'inversify';
import { QueryFilter } from '../../interfaces/query';
import { User } from '../../models/user';
import { HttpService } from '../../ports/services/HttpService';
import { MessageService } from '../../ports/services/MessageService';
import { TYPES } from '../../types/InversifyTypes';

@injectable()
export class MessageServiceImpl implements MessageService {
  @inject(TYPES.HttpService) private _httpService: HttpService;

  getLatestMessages = () => this._httpService.get(`user-message/last/messages`);

  getUserMessages = (destination: User, query: QueryFilter) =>
    this._httpService.get(
      `user-message/${destination.username}?take=${query.take}&skip=${query.skip}`
    );

  getLastGroupMessage = (groupId: string) =>
    this._httpService.get(`group-message/last/${groupId}`);

  getGroupMessages = (groupId: string, query: QueryFilter) =>
    this._httpService.get(
      `group-message/${groupId}?take=${query.take}&skip=${query.skip}`
    );
}
