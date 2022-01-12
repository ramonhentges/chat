import { Type } from 'class-transformer';
import { Message } from './message';
import { User } from './user';

export class ReadedBy {
  id: string;

  @Type(() => User)
  user: User;

  @Type(() => Message)
  message: Message;

  readedAt: Date;
}
