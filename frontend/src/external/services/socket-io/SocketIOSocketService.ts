import { injectable } from 'inversify';
import io from 'socket.io-client';
import { SocketService } from '../../../ports/services/SocketService';

const { REACT_APP_BASE_API_URL } = process.env;

@injectable()
export class SocketIOSocketService implements SocketService {
  private readonly socket;

  constructor() {
    this.socket = io(`${REACT_APP_BASE_API_URL}`, { autoConnect: false });
    this.socket.on('connect', function () {
      console.log('Connected');
    });
  }

  connect = () => {
    this.socket.connect();
  };

  disconnect = () => {
    this.socket.disconnect();
  };

  sendUserMessage = (destinationUsername: string, message: string) => {
    this.socket.emit('msgToUser', {
      message,
      destination: destinationUsername
    });
  };

  sendGroupMessage = (groupId: string, message: string) => {
    this.socket.emit('msgToGroup', {
      message,
      destination: groupId
    });
  };

  deleteUserMessage = (messageId: string) => {
    this.socket.emit('deleteUserMessage', messageId);
  };

  deleteGroupMessage = (messageId: string) => {
    this.socket.emit('deleteGroupMessage', messageId);
  };

  setAuthorizationToken = (token: string) => {
    this.socket.io.opts['transportOptions'] = {
      polling: {
        extraHeaders: {
          Authorization: `Bearer ${token}`
        }
      }
    };
  };

  addListner = (id: string, listener: (...args: any[]) => void) => {
    this.socket.on(id, listener);
  };

  removeListner = (id: string) => {
    this.socket.off(id);
  };
}
