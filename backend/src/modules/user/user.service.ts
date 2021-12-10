import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwsTokenDto } from '../auth/dto/jws-token.dto';
import { UserDto } from './dto/user.dto';
import { Group } from 'src/models/group.model';
import { User } from 'src/models/user.model';
import AlreadyExists from 'src/validation/already.exists.validator';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/edit-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>
  ) {}

  listAll() {
    return this.userRepo.find({
      select: ['username', 'fullName', 'createdAt']
    });
  }

  getByID(id: string) {
    return this.userRepo.findOneOrFail({
      where: { id }
    });
  }

  getByIDWithoutID(id: string) {
    return this.userRepo.findOneOrFail({
      where: { id },
      select: ['username', 'fullName']
    });
  }

  getByUsername(username: string) {
    return this.userRepo.findOneOrFail({
      where: { username },
      select: ['id', 'fullName', 'username', 'createdAt']
    });
  }

  getByUsernameWithoutID(username: string) {
    return this.userRepo.findOneOrFail({
      where: { username },
      select: ['fullName', 'username', 'createdAt']
    });
  }

  async getUserGroups(id: string): Promise<Group[]> {
    const user = await this.userRepo.findOne({
      relations: ['groups'],
      where: { id }
    });
    return user.groups;
  }

  async store(userDto: UserDto) {
    const user = this.userRepo.create(userDto);
    if (await AlreadyExists(this.userRepo, 'username', user.username)) {
      throw new UnprocessableEntityException({
        username: 'Nome de usuário já utilizado'
      });
    }
    return this.userRepo.save(user);
  }

  async update(token: JwsTokenDto, userDto: UpdateUserDto) {
    this.userRepo.update({ id: token.id }, userDto);
    return await this.userRepo.findOne({ where: { id: token.id } });
  }

  async login(username: string, password: string) {
    return this.userRepo.findOne({
      where: { username, password },
      select: ['username', 'id']
    });
  }
}
