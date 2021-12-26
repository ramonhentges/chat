import { User } from 'src/models/user.model';
import { CreateUserData } from './create-user-data';
import { UpdateUserData } from './update-user-data';

export interface UserRepository {
  findAll(): Promise<User[]>;
  findOneById(id: string): Promise<User>;
  findOneByUsername(username: string): Promise<User>;
  findOneByUsernameWithPassword(username: string): Promise<User>;
  findOneByIdWithGroups(id: string): Promise<User>;
  add(user: CreateUserData): Promise<User>;
  updateById(id: string, user: UpdateUserData): Promise<User>;
}
