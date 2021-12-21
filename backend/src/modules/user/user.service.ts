import {
  Inject,
  Injectable,
  UnprocessableEntityException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwsTokenDto } from '../auth/dto/jws-token.dto';
import { UserDto } from './dto/user.dto';
import { Group } from 'src/models/group.model';
import { User } from 'src/models/user.model';
import AlreadyExists from 'src/validation/already.exists.validator';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/edit-user.dto';
import { Encoder } from 'src/ports/encoder';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @Inject('ENCODER')
    private encoder: Encoder
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
    const hashPassword = await this.encoder.encode(userDto.password);
    const user = this.userRepo.create({ ...userDto, password: hashPassword });
    if (await AlreadyExists(this.userRepo, 'username', user.username)) {
      throw new UnprocessableEntityException({
        username: 'Nome de usuário já utilizado'
      });
    }
    return this.userRepo.save(user);
  }

  async update(token: JwsTokenDto, userDto: UpdateUserDto) {
    if (userDto.password) {
      const hashPassword = await this.encoder.encode(userDto.password);
      this.userRepo.update(
        { id: token.id },
        { ...userDto, password: hashPassword }
      );
    } else {
      this.userRepo.update({ id: token.id }, userDto);
    }
    return await this.userRepo.findOne({ where: { id: token.id } });
  }

  async login(username: string, password: string) {
    const user = await this.userRepo.findOne({
      where: { username },
      select: ['username', 'password', 'id']
    });
    if (user) {
      if (await this.encoder.compare(password, user.password)) {
        return user;
      }
    }
    return undefined;
  }
}
