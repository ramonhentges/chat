import { Group } from '../models/group';
import { User } from '../models/user';

export interface IDestinationMessage {
  destination: () => Group | User;
}
