import { Container } from 'inversify';
import { AxiosAuthService } from '../external/api/axios/AxiosAuthService';
import { AxiosMessageService } from '../external/api/axios/AxiosMessageService';
import { SERVICE_TYPES } from '../types/Service';

let container = new Container();

container
  .bind(SERVICE_TYPES.AuthService)
  .to(AxiosAuthService);

container
  .bind(SERVICE_TYPES.MessageService)
  .to(AxiosMessageService);

export { container };
