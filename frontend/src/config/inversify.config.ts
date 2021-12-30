import { Container } from 'inversify';
import { AxiosAuthService } from '../external/services/axios/AxiosAuthService';
import { AxiosGroupService } from '../external/services/axios/AxiosGroupService';
import { AxiosMessageService } from '../external/services/axios/AxiosMessageService';
import { SERVICE_TYPES } from '../types/Service';

let container = new Container();

container.bind(SERVICE_TYPES.AuthService).to(AxiosAuthService);

container.bind(SERVICE_TYPES.MessageService).to(AxiosMessageService);

container.bind(SERVICE_TYPES.GroupService).to(AxiosGroupService);

export { container };
