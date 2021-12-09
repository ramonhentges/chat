import { Group } from '../models/group';
import { User } from '../models/user';

export interface IMessage {
  id: string;
  destination: () => Group | User;
  getMessage: () => string;
  getCardMessage: (user: User) => string;
  getContact: (user: User) => Group | User;
}
