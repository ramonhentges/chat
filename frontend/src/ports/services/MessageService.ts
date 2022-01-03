import { QueryFilter } from '../../interfaces/query';
import { User } from '../../models/user';
import { HttpResponse } from '../../types/HttpResponse';

export interface MessageService {
  getLatestMessages: () => Promise<HttpResponse>;

  getUserMessages: (
    destination: User,
    query: QueryFilter
  ) => Promise<HttpResponse>;

  getLastGroupMessage: (groupId: string) => Promise<HttpResponse>;

  getGroupMessages: (
    groupId: string,
    query: QueryFilter
  ) => Promise<HttpResponse>;
}
