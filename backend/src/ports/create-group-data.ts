import { User } from '@/models/user.model';

export interface CreateGroupData {
  name: string;
  description: string;
  users: User[];
}
