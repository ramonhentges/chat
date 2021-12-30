import { injectable } from 'inversify';
import { LoginDto } from '../../../dto/login';
import { HttpStatus } from '../../../enum/http-status.enum';
import { api } from '../../../services/api';
import { AuthService } from '../../../services/AuthService';
import { HttpResponse } from '../../../types/HttpResponse';

@injectable()
export class AxiosAuthService implements AuthService {
  async login(usuario: LoginDto): Promise<HttpResponse> {
    return api
      .post('auth/login', usuario)
      .then((response) => {
        if (response.status === HttpStatus.OK) {
          api.defaults.headers.common[
            'Authorization'
          ] = `Bearer ${response.data.accessToken}`;
          localStorage.setItem('accessToken', JSON.stringify(response.data));
        }
        return response;
      })
      .catch((err) => {
        return err.response;
      });
  }
}
