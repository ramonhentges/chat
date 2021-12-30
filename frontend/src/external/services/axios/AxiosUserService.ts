import { injectable } from 'inversify';
import { CreateUserDto } from '../../../dto/create-user';
import { UpdateUserDto } from '../../../dto/update-user';
import { api } from '../../../services/api';
import { UserService } from '../../../services/UserService';

@injectable()
export class AxiosUserService implements UserService {
  createUser = (user: CreateUserDto) =>
    api
      .post(`/users`, user)
      .then((response) => {
        return response;
      })
      .catch((err) => {
        return err.response;
      });

  myUserInfo = () => api.get(`users/my/user`);

  usersList = () => api.get(`users`);

  updateUser = (data: UpdateUserDto) =>
    api({ url: 'users', method: 'PUT', data });
}
