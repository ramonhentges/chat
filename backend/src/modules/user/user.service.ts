import {
  Inject,
  Injectable,
  NotFoundException,
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
import { TypeormUserRepository } from 'src/external/repositories/typeorm/typeorm-user-repository';
import { UserRepository } from 'src/ports/user-repository';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(TypeormUserRepository)
    private userRepo: UserRepository,
    @Inject('ENCODER')
    private encoder: Encoder
  ) { }

  listAll() {
    return this.userRepo.findAll()
  }

  async getByID(id: string) {
    const user = await this.userRepo.findOneById(id);
    if (user) {
      return user;
    }
    throw new NotFoundException('Usuário não encontrado');
  }

  async getByIDWithoutID(id: string) {
    const user = await this.userRepo.findOneById(id);
    if (user) {
      delete user.id;
      return user;
    }
    throw new NotFoundException('Usuário não encontrado');
  }

  async getByUsername(username: string) {
    const user = await this.userRepo.findOneByUsername(username);
    if (user) {
      return user;
    }
    throw new NotFoundException('Usuário não encontrado');
  }

  async getByUsernameWithoutID(username: string) {
    const user = await this.userRepo.findOneByUsername(username);
    if (user) {
      delete user.id;
      return user;
    }
    throw new NotFoundException('Usuário não encontrado');
  }

  async getUserGroups(id: string): Promise<Group[]> {
    const user = await this.userRepo.findOneByIdWithGroups(id);
    if (user) {
      return user.groups;
    }
    throw new NotFoundException('Usuário não encontrado');
  }

  async store(userDto: UserDto) {
    const user = await this.userRepo.findOneByUsername(userDto.username);
    if (user) {
      throw new UnprocessableEntityException({
        username: 'Nome de usuário já utilizado'
      });
    }
    const hashPassword = await this.encoder.encode(userDto.password);
    const userData = { ...userDto, password: hashPassword };
    return this.userRepo.add(userData);
  }

  async update(token: JwsTokenDto, userDto: UpdateUserDto) {
    if (userDto.password) {
      const hashPassword = await this.encoder.encode(userDto.password);
      this.userRepo.updateById(token.id, { ...userDto, password: hashPassword })

    } else {
      this.userRepo.updateById(token.id, userDto)
    }
    return await this.userRepo.findOneById(token.id)
  }

  async login(username: string, password: string) {
    const user = await this.userRepo.findOneByUsernameWithPassword(username);
    if (user) {
      if (await this.encoder.compare(password, user.password)) {
        return user;
      }
    }
    return undefined;
  }
}
