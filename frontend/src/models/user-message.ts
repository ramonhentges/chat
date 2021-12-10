import { Type } from 'class-transformer';
import { IMessage } from '../interfaces/i-message';
import { Message } from './message';
import { User } from './user';

export class UserMessage extends Message implements IMessage {
  constructor() {
    super();
    this.userDestination = new User();
  }

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
