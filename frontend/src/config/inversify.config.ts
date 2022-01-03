import { Container } from 'inversify';
import { AuthServiceImpl } from '../adapters/services/AuthServiceImpl';
import { GroupServiceImpl } from '../adapters/services/GroupServiceImpl';
import { MessageServiceImpl } from '../adapters/services/MessageServiceImpl';
import { UserServiceImpl } from '../adapters/services/UserServiceImpl';
import { AxiosHttpService } from '../external/services/axios/AxiosHttpService';

import { SERVICE_TYPES } from '../types/Service';

let container = new Container();

container.bind(SERVICE_TYPES.AuthService).to(AuthServiceImpl);

container.bind(SERVICE_TYPES.MessageService).to(MessageServiceImpl);

container.bind(SERVICE_TYPES.GroupService).to(GroupServiceImpl);

container.bind(SERVICE_TYPES.UserService).to(UserServiceImpl);

container
  .bind(SERVICE_TYPES.HttpService)
  .to(AxiosHttpService)
  .inSingletonScope();

export { container };
