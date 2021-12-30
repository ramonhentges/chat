import { LoginDto } from '../dto/login';
import { HttpResponse } from '../types/HttpResponse';

export interface AuthService {
  login: (usuario: LoginDto) => Promise<HttpResponse>;
}
