import io from 'socket.io-client';

const { REACT_APP_BASE_API_URL } = process.env;
const socket = io(`${REACT_APP_BASE_API_URL}`, { autoConnect: false });
const sendUserMessage = (destinationUsername: string, message: string) => {
  socket.emit('msgToUser', {
    message,
    destination: destinationUsername
  });
};

const sendGroupMessage = (groupId: string, message: string) => {
  socket.emit('msgToGroup', {
    message,
    destination: groupId
  });
};

const deleteUserMessage = (messageId: string) => {
  socket.emit('deleteUserMessage', messageId);
};

const setAuthorizationToken = (token: string) => {
  socket.io.opts['transportOptions'] = {
    polling: {
      extraHeaders: {
        Authorization: `Bearer ${token}`
      }
    }
  };
};

socket.on('connect', function () {
  console.log('Connected');
});

export {
  socket,
  sendUserMessage,
  setAuthorizationToken,
  sendGroupMessage,
  deleteUserMessage
};
