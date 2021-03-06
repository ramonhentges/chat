import { Type } from 'class-transformer';
import { IDestination } from '../interfaces/i-destination';
import { User } from './user';

export class Group implements IDestination {
  constructor() {
    this.id = '';
    this.name = '';
    this.description = '';
    this.createdAt = new Date();
    this.users = [];
  }
  id: string;
  name: string;
  description: string;

  @Type(() => User)
  users: User[];

  @Type(() => Date)
  createdAt: Date;
  getTitle = () => {
    return this.name;
  };
  getSubtitle = () => {
    return this.description;
  };

  getKey = () => {
    return this.id;
  };

  getConversationTitle = () => {
    return this.name;
  };
}
