import { Message, User } from '@/models';
import { ReadedBy } from '@/models/readed-by.model';
import { ReadedByRepository } from '@/ports';

export class InMemoryReadedByRepository implements ReadedByRepository {
  private readonly _data: ReadedBy[];
  private idcounter = 0;

  constructor(data: ReadedBy[]) {
    this._data = data;
  }
  async markAsReaded(messages: Message[], user: User): Promise<ReadedBy[]> {
    const returnedReadedBy: ReadedBy[] = [];
    messages.forEach((message) => {
      const readedBy = new ReadedBy();
      readedBy.message = message;
      readedBy.user = user;
      readedBy.id = `${this.idcounter}`;
      readedBy.readedAt = new Date();
      this._data.push(readedBy);
      message.readedBy.push(readedBy);
      returnedReadedBy.push(readedBy);
      this.idcounter++;
    });
    return returnedReadedBy;
  }
}
