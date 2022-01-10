import { Message, User } from '@/models';
import { ReadedBy } from '@/models/readed-by.model';
import { ReadedByRepository } from '@/ports';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(ReadedBy)
export class TypeormReadedByRepository
  extends Repository<ReadedBy>
  implements ReadedByRepository
{
  markAsReaded(messages: Message[], user: User): Promise<ReadedBy[]> {
    const readed = messages.map((message) => this.create({ message, user }));
    return this.save(readed);
  }
}
