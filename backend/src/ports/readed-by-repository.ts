import { User, Message } from '@/models';
import { ReadedBy } from '@/models/readed-by.model';

export interface ReadedByRepository {
  markAsReaded(messages: Message[], user: User): Promise<ReadedBy[]>;
}
