import { CreateUser } from '../interfaces/create-user';
import { api } from './api';

const createUser = (user: CreateUser) =>
  api
    .post(`/users`, user)
    .then((response) => {
      return response;
    })
    .catch((err) => {
      return err.response;
    });

const myUserInfo = () => api.get(`users/my/user`);

const usersList = () => api.get(`users`);

export { createUser, myUserInfo, usersList };
