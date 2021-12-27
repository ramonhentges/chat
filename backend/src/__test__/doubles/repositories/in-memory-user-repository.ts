import { User } from 'src/models/user.model';
import { CreateUserData } from 'src/ports/create-user-data';
import { UpdateUserData } from 'src/ports/update-user-data';
import { UserRepository } from 'src/ports/user-repository';
import GroupBuilder from '../../builder/group-builder';

export class InMemoryUserRepository implements UserRepository {
  private readonly _data: User[];
  private idcounter = 0;
  private get data() {
    return this._data;
  }

  constructor(data: User[]) {
    this._data = data;
  }
  async findOneByUsernameWithPassword(username: string): Promise<User> {
    return this.data.find((user) => user.username === username);
  }
  async updateById(id: string, user: UpdateUserData): Promise<User> {
    const originalUser = await this.findOneById(id);
    if (user.fullName) {
      originalUser.fullName = user.fullName;
    }
    if (user.password) {
      originalUser.password = user.password;
    }
    return originalUser;
  }

  async findAll(): Promise<User[]> {
    return this.data;
  }

  async findOneById(id: string): Promise<User> {
    return this.data.find((user) => user.id === id);
  }

  async findOneByUsername(username: string): Promise<User> {
    return this.data.find((user) => user.username === username);
  }

  async findOneByIdWithGroups(id: string): Promise<User> {
    return this.data.find((user) => user.id === id);
  }

  async add(user: CreateUserData): Promise<User> {
    const userClass = new User();
    userClass.id = this.idcounter.toString();
    userClass.username = user.username;
    userClass.fullName = user.fullName;
    userClass.password = user.password;
    userClass.createdAt = new Date();
    userClass.groups = [GroupBuilder.aGroup().build()];
    this.idcounter++;
    this._data.push(userClass);
    return userClass;
  }
}
