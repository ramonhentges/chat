import { User } from '@/models/user.model';
import { CreateUserData } from '@/ports/create-user-data';
import { UpdateUserData } from '@/ports/update-user-data';
import { UserRepository } from '@/ports/user-repository';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(User)
export class TypeormUserRepository
  extends Repository<User>
  implements UserRepository
{
  async updateById(id: string, user: UpdateUserData): Promise<User> {
    await this.update({ id }, user);
    return this.findOne({ where: { id } });
  }
  findOneByUsernameWithPassword(username: string): Promise<User> {
    return this.findOne({
      where: { username },
      select: ['id', 'fullName', 'password', 'username', 'createdAt']
    });
  }
  findAll(): Promise<User[]> {
    return this.find({
      select: ['username', 'fullName', 'createdAt']
    });
  }
  findOneById(id: string): Promise<User> {
    return this.findOne({
      where: { id }
    });
  }
  findOneByUsername(username: string): Promise<User> {
    return this.findOne({
      where: { username },
      select: ['id', 'fullName', 'username', 'createdAt']
    });
  }
  findOneByIdWithGroups(id: string): Promise<User> {
    return this.findOne({
      relations: ['groups', 'groups.users'],
      where: { id }
    });
  }
  add(userDto: CreateUserData): Promise<User> {
    const user = this.create(userDto);
    return this.save(user);
  }
}
