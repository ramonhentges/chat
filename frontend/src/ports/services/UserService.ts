import { CreateUserDto } from '../../dto/create-user';
import { UpdateUserDto } from '../../dto/update-user';
import { HttpResponse } from '../../types/HttpResponse';

export interface UserService {
  createUser: (user: CreateUserDto) => Promise<HttpResponse>;

  myUserInfo: () => Promise<HttpResponse>;

  usersList: () => Promise<HttpResponse>;

  updateUser: (data: UpdateUserDto) => Promise<HttpResponse>;
}
