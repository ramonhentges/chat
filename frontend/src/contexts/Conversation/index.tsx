import React, { useContext, useState, useEffect, useCallback } from 'react';
import { Group } from '../../models/group';
import { User } from '../../models/user';
import { UserMessage } from '../../models/user-message';
import {
  getLatestMessages,
  getUserMessages
} from '../../services/message.service';
import { useAuth } from '../Auth';
import {
  socket,
  sendUserMessage,
  sendGroupMessage
} from '../../services/socket.service';
import { plainToInstance } from 'class-transformer';

enum MessageType {
  Sended,
  Received
}

interface ConversationContextProps {
  destination: Group | User | null;
  setDestination: (destination: Group | User) => void;
  loading: boolean;
  messages: UserMessage[];
  sendMessage: (message: string) => void;
  lastMessages: UserMessage[];
  selectedMessage: UserMessage | undefined;
  setSelectedMessage: (message: UserMessage | undefined) => void;
}

const sortLastMessages = (a: UserMessage, b: UserMessage): number => {
  return a.createdAt > b.createdAt ? -1 : a.createdAt === b.createdAt ? 0 : 1;
};

const ConversationContext = React.createContext<ConversationContextProps>(
  {} as ConversationContextProps
);

export const ConversationProvider: React.FC = ({ children }) => {
  const [destination, setDestinationState] = useState<Group | User | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [lastMessages, setLastMessages] = useState<UserMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<
    UserMessage | undefined
  >();

  const { signOut } = useAuth();

  useEffect(() => {
    async function getLastMessages() {
      const latestMessages = await getLatestMessages();
      if (latestMessages?.status === 200) {
        setLastMessages(
          plainToInstance(UserMessage, latestMessages.data as []).sort(
            sortLastMessages
          )
        );
      }
    }
    getLastMessages();
  }, []);

  const receiveUserMessage = useCallback(
    (message: UserMessage, messageType: MessageType) => {
      if (message.origin.username === message.userDestination.username) {
        if (
          lastMessages.some(
            (lastMessage) =>
              lastMessage.origin.username === message.origin.username &&
              lastMessage.userDestination.username ===
                message.userDestination.username
          )
        ) {
          setLastMessages((prevState) =>
            prevState
              .map((lastMessage) => {
                if (
                  destination &&
                  'username' in destination &&
                  lastMessage.origin.username === message.origin.username &&
                  lastMessage.userDestination.username ===
                    message.userDestination.username
                ) {
                  return message;
                }
                return lastMessage;
              })
              .sort(sortLastMessages)
          );
        } else {
          setLastMessages((prevState) =>
            [message, ...prevState].sort(sortLastMessages)
          );
        }
      } else if (
        messageType === MessageType.Received
          ? lastMessages.some((lastMessage) =>
              [
                lastMessage.origin.username,
                lastMessage.userDestination.username
              ].includes(message.origin.username)
            )
          : lastMessages.some((lastMessage) =>
              [
                lastMessage.origin.username,
                lastMessage.userDestination.username
              ].includes(message.userDestination.username)
            )
      ) {
        if (messageType === MessageType.Received) {
          setLastMessages((prevState) =>
            prevState
              .map((lastMessage) => {
                if (
                  [
                    lastMessage.origin.username,
                    lastMessage.userDestination.username
                  ].includes(message.origin.username)
                ) {
                  return message;
                }
                return lastMessage;
              })
              .sort(sortLastMessages)
          );
        } else if (messageType === MessageType.Sended) {
          setLastMessages((prevState) =>
            prevState
              .map((lastMessage) => {
                if (
                  [
                    lastMessage.origin.username,
                    lastMessage.userDestination.username
                  ].includes(message.userDestination.username)
                ) {
                  return message;
                }
                return lastMessage;
              })
              .sort(sortLastMessages)
          );
        }
      } else {
        setLastMessages((prevState) =>
          [message, ...prevState].sort(sortLastMessages)
        );
      }

      if (
        destination &&
        messageType === MessageType.Received &&
        'username' in destination &&
        destination.username === message.origin.username
      ) {
        setMessages((oldMsgs) => [...oldMsgs, message]);
      } else if (
        destination &&
        messageType === MessageType.Sended &&
        'username' in destination &&
        destination.username === message.userDestination.username
      ) {
        setMessages((oldMsgs) => [...oldMsgs, message]);
      }
    },
    [destination, lastMessages]
  );

  const deleteMessage = (deletedMessage: UserMessage) => {
    setMessages((prevMessages) =>
      prevMessages.map((message) => {
        return message.id === deletedMessage.id ? deletedMessage : message;
      })
    );
    setLastMessages((prevMessages) =>
      prevMessages.map((message) => {
        return message.id === deletedMessage.id ? deletedMessage : message;
      })
    );
  };

  useEffect(() => {
    socket.off('sendedMsgFromUser');
    socket.on('sendedMsgFromUser', (message: UserMessage) => {
      receiveUserMessage(
        plainToInstance(UserMessage, message),
        MessageType.Sended
      );
    });

    socket.off('msgFromUser');
    socket.on('msgFromUser', (message: UserMessage) => {
      receiveUserMessage(
        plainToInstance(UserMessage, message),
        MessageType.Received
      );
    });
  }, [receiveUserMessage]);

  useEffect(() => {
    socket.off('deleteMsgFromUser');
    socket.on('deleteMsgFromUser', (message: UserMessage) => {
      deleteMessage(
        plainToInstance(UserMessage, { ...message, message: '' })
      );
    });
  }, []);

  useEffect(() => {
    setSelectedMessage(undefined);
  }, [destination]);

  async function setDestination(destination: Group | User) {
    setDestinationState(destination);
    setLoading(true);
    await getMessages(destination);
    setLoading(false);
  }

  function sendMessage(message: string) {
    if (destination && 'username' in destination) {
      sendUserMessage(destination.username, message);
    } else if (destination && 'id' in destination) {
      sendGroupMessage(destination.id, message);
    }
  }

  async function getMessages(destination: Group | User) {
    if ('username' in destination) {
      await getMessagesFromUser(destination);
    }
  }

  async function getMessagesFromUser(destination: User) {
    const response = await getUserMessages(destination);
    if (response.status === 200) {
      setMessages(plainToInstance(UserMessage, response.data as []));
    }
    if (response.status === 401) {
      signOut();
    }
  }

  return (
    <ConversationContext.Provider
      value={{
        destination,
        setDestination,
        loading,
        messages,
        sendMessage,
        lastMessages,
        selectedMessage,
        setSelectedMessage
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
};

export const useConversation = () => useContext(ConversationContext);
