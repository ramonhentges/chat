import { CreateUserDto } from '../dto/create-user';
import { UpdateUserDto } from '../dto/update-user';
import { api } from './api';

export const createUser = (user: CreateUserDto) =>
  api
    .post(`/users`, user)
    .then((response) => {
      return response;
    })
    .catch((err) => {
      return err.response;
    });

export const myUserInfo = () => api.get(`users/my/user`);

export const usersList = () => api.get(`users`);

export const updateUser = (data: UpdateUserDto) =>
  api({ url: 'users', method: 'PUT', data });
