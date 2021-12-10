import { Type } from 'class-transformer';
import { IMessage } from '../interfaces/i-message';
import { Group } from './group';
import { Message } from './message';
import { User } from './user';

export class GroupMessage extends Message implements IMessage {
  constructor() {
    super();
    this.groupDestination = new Group();
  }

  @Type(() => Group)
  groupDestination: Group;

  getMessage() {
    return this.deleted ? 'Mensagem apagada' : this.message;
  }

  getCardMessage(user: User) {
    if (user.getKey() === this.origin.getKey()) {
      return `Você: ${this.getMessage()}`;
    } else if (this.origin.getKey() === '') {
      return this.getMessage();
    }
    return `${this.origin.getTitle()} - ${this.getMessage()}`;
  }

  getContact(user: User) {
    return this.groupDestination;
  }

  destination() {
    return this.groupDestination;
  }
}
