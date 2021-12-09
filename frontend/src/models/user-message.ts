import { Type } from 'class-transformer';
import { IMessage } from '../interfaces/i-message';
import { User } from './user';

export class UserMessage implements IMessage {
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

  getCardMessage(user: User) {
    if (user.getKey() === this.origin.getKey()) {
      return `Você: ${this.getMessage()}`;
    }
    return this.getMessage();
  }

  getContact(user: User) {
    if (this.origin.getKey() === user.getKey()) {
      return this.userDestination;
    }
    return this.origin;
  }

  destination() {
    return this.userDestination;
  }
}
