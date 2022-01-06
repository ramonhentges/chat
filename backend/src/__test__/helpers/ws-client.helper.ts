import * as SocketClient from 'socket.io-client';
import { INestApplication } from '@nestjs/common';
import { User } from '@/models';

export const getClientWebsocketForApp = (
  app: INestApplication,
  user?: User
) => {
  const httpServer = app.getHttpServer();
  if (!httpServer.address()) {
    httpServer.listen(0);
  }
  let options = {};
  if (user) {
    options = {
      transportOptions: {
        polling: {
          extraHeaders: {
            Authorization: JSON.stringify(user)
          }
        }
      }
    };
  }
  return SocketClient.io(
    `http://127.0.0.1:${httpServer.address().port}`,
    options
  );
};
