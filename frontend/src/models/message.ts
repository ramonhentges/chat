import { Type } from 'class-transformer';
import { MINUTES_TO_DELETE_MESSAGE } from '../constants/message';
import { ReadedBy } from './readed-by.model';
import { User } from './user';

export class Message {
  constructor() {
    this.id = '';
    this.message = '';
    this.deleted = false;
    this.createdAt = new Date();
    this.origin = new User();
  }

  id: string;
  message: string;
  deleted: boolean;

  @Type(() => ReadedBy)
  readedBy: ReadedBy[];

  @Type(() => Date)
  createdAt: Date;

  @Type(() => User)
  origin: User;

  canDelete(): boolean {
    const endDate = new Date(this.createdAt);
    endDate.setMinutes(this.createdAt.getMinutes() + MINUTES_TO_DELETE_MESSAGE);
    if (endDate > new Date()) {
      return true;
    }
    return false;
  }
}
