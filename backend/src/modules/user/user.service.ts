import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwsTokenDto } from '../auth/dto/jws-token.dto';
import { UserDto } from './dto/user.dto';
import { Group } from 'src/models/group.model';
import { User } from 'src/models/user.model';
import AlreadyExists from 'src/validation/already.exists.validator';
import { Repository } from 'typeorm';

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

  getByUUID(uuid: string) {
    return this.userRepo.findOneOrFail({
      where: { uuid }
    });
  }

  getByUUIDWithoutID(uuid: string) {
    return this.userRepo.findOneOrFail({
      where: { uuid },
      select: ['username', 'fullName']
    });
  }

  getByUsername(username: string) {
    return this.userRepo.findOneOrFail({
      where: { username },
      select: ['id', 'uuid', 'fullName', 'username', 'createdAt']
    });
  }

  getByUsernameWithoutID(username: string) {
    return this.userRepo.findOneOrFail({
      where: { username },
      select: ['fullName', 'username', 'createdAt']
    });
  }

  async getUserGroups(uuid: string): Promise<Group[]> {
    const user = await this.userRepo.findOne({
      relations: ['groups'],
      where: { uuid }
    });
    return user.groups;
  }

  async store(userDto: UserDto) {
    const user = this.userRepo.create(userDto);
    if (await AlreadyExists(this.userRepo, 'username', user.username)) {
      throw new UnprocessableEntityException([
        {
          property: 'username',
          constraints: {
            exists: 'Nome de usuário já cadastrado'
          }
        }
      ]);
    }
    return this.userRepo.save(user);
  }

  async update(token: JwsTokenDto, userDto: UserDto) {
    if (
      await AlreadyExists(
        this.userRepo,
        'username',
        userDto.username,
        token.uuid
      )
    ) {
      throw new UnprocessableEntityException([
        {
          property: 'username',
          constraints: {
            exists: 'Nome de usuário já cadastrado'
          }
        }
      ]);
    }
    this.userRepo.update({ uuid: token.uuid }, userDto);
    return await this.userRepo.findOne({ where: { uuid: token.uuid } });
  }

  async login(username: string, password: string) {
    return this.userRepo.findOne({
      where: { username, password },
      select: ['username', 'uuid']
    });
  }
}