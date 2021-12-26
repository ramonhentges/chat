import { User } from 'src/models/user.model';

export interface CreateGroupData {
  name: string;
  description: string;
  users: User[];
}
