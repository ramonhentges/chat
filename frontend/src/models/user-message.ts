import { Type } from 'class-transformer';
import { User } from './user';

export class UserMessage {
  constructor() {
    this.id = '';
    this.message = '';
    this.deleted = false;
    this.createdAt = new Date();
    this.origin = new User();
    this.userDestination = new User();
  }
  id: string;
  message: string;
  deleted: boolean;

  @Type(() => Date)
  createdAt: Date;

  @Type(() => User)
  origin: User;

  @Type(() => User)
  userDestination: User;

  getMessage() {
    return this.deleted ? 'Mensagem apagada' : this.message;
  }
}
