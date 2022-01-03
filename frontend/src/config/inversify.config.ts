import { Container } from 'inversify';
import { AuthServiceImpl } from '../adapters/services/AuthServiceImpl';
import { GroupServiceImpl } from '../adapters/services/GroupServiceImpl';
import { MessageServiceImpl } from '../adapters/services/MessageServiceImpl';
import { UserServiceImpl } from '../adapters/services/UserServiceImpl';
import { ClassTransformerPlainClassConverter } from '../external/ClassTransformerPlainClassConverter';
import { AxiosHttpService } from '../external/services/axios/AxiosHttpService';
import { SocketIOSocketService } from '../external/services/socket-io/SocketIOSocketService';

import { TYPES } from '../types/InversifyTypes';

let container = new Container();

container.bind(TYPES.AuthService).to(AuthServiceImpl);

container.bind(TYPES.MessageService).to(MessageServiceImpl);

container.bind(TYPES.GroupService).to(GroupServiceImpl);

container.bind(TYPES.UserService).to(UserServiceImpl);

container
  .bind(TYPES.HttpService)
  .to(AxiosHttpService)
  .inSingletonScope();

container
  .bind(TYPES.SocketService)
  .to(SocketIOSocketService)
  .inSingletonScope();

container
  .bind(TYPES.PlainClassConverter)
  .to(ClassTransformerPlainClassConverter);

export { container };
