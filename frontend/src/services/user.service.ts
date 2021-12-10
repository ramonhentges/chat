import { CreateUser } from '../interfaces/create-user';
import { EditUser } from '../interfaces/edit-user';
import { api } from './api';

export const createUser = (user: CreateUser) =>
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

export const updateUser = (data: EditUser) =>
  api({ url: 'users', method: 'PUT', data });
