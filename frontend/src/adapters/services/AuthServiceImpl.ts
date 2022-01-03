import { inject, injectable } from 'inversify';
import { LoginDto } from '../../dto/login';
import { HttpStatus } from '../../enum/http-status.enum';
import { AuthService } from '../../ports/services/AuthService';
import { HttpService } from '../../ports/services/HttpService';
import { HttpResponse } from '../../types/HttpResponse';
import { TYPES } from '../../types/InversifyTypes';

@injectable()
export class AuthServiceImpl implements AuthService {
  @inject(TYPES.HttpService) private _httpService: HttpService;

  async login(usuario: LoginDto): Promise<HttpResponse> {
    return this._httpService
      .post('auth/login', usuario)
      .then((response) => {
        if (response.status === HttpStatus.OK) {
          this._httpService.setAuthenticationToken(response.data.accessToken);
          localStorage.setItem('accessToken', JSON.stringify(response.data));
        }
        return response;
      })
      .catch((err) => {
        return err.response;
      });
  }
}
