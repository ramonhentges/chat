export interface SocketService {
  sendUserMessage: (destinationUsername: string, message: string) => void;

  sendGroupMessage: (groupId: string, message: string) => void;

  deleteUserMessage: (messageId: string) => void;

  deleteGroupMessage: (messageId: string) => void;

  setAuthorizationToken: (token: string) => void;

  addListner: (id: string, listener: (...args: any[]) => void) => void;

  removeListner: (id: string) => void;

  connect: () => void;

  disconnect: () => void;

  markMessageAsReaded: (messageId: string[]) => void;
}
