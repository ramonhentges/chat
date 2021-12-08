import { Type } from 'class-transformer';
import { IDestinationMessage } from '../interfaces/i-destination-message';
import { Group } from './group';
import { User } from './user';

export class GroupMessage implements IDestinationMessage {
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

  destination() {
    return this.groupDestination;
  }
}
