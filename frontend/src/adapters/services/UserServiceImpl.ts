import { inject, injectable } from 'inversify';
import { CreateUserDto } from '../../dto/create-user';
import { UpdateUserDto } from '../../dto/update-user';
import { UserService } from '../../ports/services/UserService';
import { HttpService } from '../../ports/services/HttpService';
import { SERVICE_TYPES } from '../../types/Service';

@injectable()
export class UserServiceImpl implements UserService {
  @inject(SERVICE_TYPES.HttpService) private _httpService: HttpService;

  createUser = (user: CreateUserDto) =>
    this._httpService
      .post(`/users`, user)
      .then((response) => {
        return response;
      })
      .catch((err) => {
        return err.response;
      });

  myUserInfo = () => this._httpService.get(`users/my/user`);

  usersList = () => this._httpService.get(`users`);

  updateUser = (data: UpdateUserDto) => this._httpService.put('users', data);
}
