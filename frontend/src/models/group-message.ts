import { Type } from 'class-transformer';
import { IMessage } from '../interfaces/i-message';
import { Group } from './group';
import { User } from './user';

export class GroupMessage implements IMessage {
  constructor() {
    this.id = '';
    this.message = '';
    this.deleted = false;
    this.createdAt = new Date();
    this.origin = new User();
    this.groupDestination = new Group();
  }

  id: string;
  message: string;
  deleted: boolean;

  @Type(() => Date)
  createdAt: Date;

  @Type(() => User)
  origin: User;

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
