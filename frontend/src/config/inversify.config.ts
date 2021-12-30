import { Container } from 'inversify';
import { AxiosAuthService } from '../external/api/axios/AxiosAuthService';
import { SERVICE_TYPES } from '../types/Service';

let container = new Container();

container
  .bind(SERVICE_TYPES.AuthService)
  .to(AxiosAuthService)
  .inSingletonScope();

export { container };
