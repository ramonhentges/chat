import { LoginDto } from '../dto/login';
import { api } from './api';

const login = (usuario: LoginDto) => {
  return api
    .post('auth/login', usuario)
    .then((response) => {
      return response;
    })
    .catch((err) => {
      return err.response;
    });
};

export { login };
