import { Group } from '../models/group';
import { ReadedBy } from '../models/readed-by.model';
import { User } from '../models/user';

export interface IMessage {
  id: string;
  destination: () => Group | User;
  getMessage: () => string;
  getCardMessage: (user: User) => string;
  getContact: (user: User) => Group | User;
  canDelete: () => boolean;
  createdAt: Date;
  deleted: boolean;
  origin: User;
  readedBy: ReadedBy[];
}
