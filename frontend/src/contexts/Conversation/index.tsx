import React, { useContext, useState, useEffect, useCallback } from 'react';
import { Group } from '../../models/group';
import { User } from '../../models/user';
import { UserMessage } from '../../models/user-message';
import {
  getGroupMessages,
  getLastGroupMessage,
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
import { HttpStatus } from '../../enum/http-status.enum';
import { getMyGroups } from '../../services/group.service';
import { GroupMessage } from '../../models/group-message';

export enum MessageType {
  Sended,
  Received
}

interface ConversationContextProps {
  destination: Group | User | null;
  setDestination: (destination: Group | User) => void;
  loading: boolean;
  messages: (UserMessage | GroupMessage)[];
  sendMessage: (message: string) => void;
  lastMessages: (UserMessage | GroupMessage)[];
  selectedMessage: UserMessage | GroupMessage | undefined;
  setSelectedMessage: (message: UserMessage | GroupMessage | undefined) => void;
  showInfo: boolean;
  setShowInfo: (show: boolean) => void;
  receiveMessage: (
    message: UserMessage | GroupMessage,
    messageType: MessageType
  ) => void;
}

const sortLastMessages = (
  a: UserMessage | GroupMessage,
  b: UserMessage | GroupMessage
): number => {
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
  const [messages, setMessages] = useState<(UserMessage | GroupMessage)[]>([]);
  const [lastMessages, setLastMessages] = useState<
    (UserMessage | GroupMessage)[]
  >([]);
  const [selectedMessage, setSelectedMessage] = useState<
    UserMessage | GroupMessage | undefined
  >();
  const [showInfo, setShowInfo] = useState<boolean>(false);

  const { user } = useAuth();

  useEffect(() => {
    async function getLastMessages() {
      if (user) {
        const latestUserMessages = await getLatestMessages();
        const myGroups = await getMyGroups();

        if (
          latestUserMessages?.status === HttpStatus.OK &&
          myGroups?.status === HttpStatus.OK
        ) {
          const latestGroupsMessages = myGroups.data.map(
            async (group: Group) => {
              const message = await getLastGroupMessage(group.id);
              if (message.status === HttpStatus.OK) {
                if (message.data) {
                  return { ...message.data, groupDestination: group };
                } else {
                  return {
                    id: group.id,
                    message: 'Grupo Criado',
                    deleted: false,
                    createdAt: group.createdAt,
                    origin: user,
                    groupDestination: group
                  };
                }
              }
            }
          );
          Promise.all(latestGroupsMessages).then((groupMessages) => {
            const groupMessagesClass = plainToInstance(
              GroupMessage,
              groupMessages
            );
            const userMessages = plainToInstance(
              UserMessage,
              latestUserMessages.data as []
            );
            setLastMessages(
              [...groupMessagesClass, ...userMessages].sort(sortLastMessages)
            );
          });
        }
      }
    }
    getLastMessages();
  }, [user]);

  const receiveMessage = useCallback(
    (message: UserMessage | GroupMessage, messageType: MessageType) => {
      if (message.origin.getKey() === message.destination().getKey()) {
        if (
          lastMessages.some(
            (lastMessage) =>
              lastMessage.origin.getKey() === message.origin.getKey() &&
              lastMessage.destination().getKey() ===
                message.destination().getKey()
          )
        ) {
          setLastMessages((prevState) =>
            prevState
              .map((lastMessage) => {
                if (
                  destination &&
                  lastMessage.origin.getKey() === message.origin.getKey() &&
                  lastMessage.destination().getKey() ===
                    message.destination().getKey()
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
                lastMessage.origin.getKey(),
                lastMessage.destination().getKey()
              ].includes(message.origin.getKey())
            )
          : lastMessages.some((lastMessage) =>
              [
                lastMessage.origin.getKey(),
                lastMessage.destination().getKey()
              ].includes(message.destination().getKey())
            )
      ) {
        if (messageType === MessageType.Received) {
          setLastMessages((prevState) =>
            prevState
              .map((lastMessage) => {
                if (
                  [
                    lastMessage.origin.getKey(),
                    lastMessage.destination().getKey()
                  ].includes(message.origin.getKey())
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
                    lastMessage.origin.getKey(),
                    lastMessage.destination().getKey()
                  ].includes(message.destination().getKey())
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
        destination.getKey() === message.origin.getKey()
      ) {
        setMessages((oldMsgs) => [...oldMsgs, message]);
      } else if (
        destination &&
        messageType === MessageType.Sended &&
        destination.getKey() === message.destination().getKey()
      ) {
        console.log('here kraii');
        setMessages((oldMsgs) => [...oldMsgs, message]);
      }
      console.log(destination);
      console.log(message);
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
      receiveMessage(plainToInstance(UserMessage, message), MessageType.Sended);
    });

    socket.off('msgFromUser');
    socket.on('msgFromUser', (message: UserMessage) => {
      receiveMessage(
        plainToInstance(UserMessage, message),
        MessageType.Received
      );
    });
    socket.off('msgFromGroup');
    socket.on('msgFromGroup', (message: GroupMessage) => {
      receiveMessage(
        plainToInstance(GroupMessage, message),
        MessageType.Sended
      );
    });
  }, [receiveMessage]);

  useEffect(() => {
    socket.off('deleteMsgFromUser');
    socket.on('deleteMsgFromUser', (message: UserMessage) => {
      deleteMessage(plainToInstance(UserMessage, { ...message, message: '' }));
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
    } else {
      await getGroupMessagesFromUser(destination);
    }
  }

  async function getMessagesFromUser(destination: User) {
    const response = await getUserMessages(destination);
    if (response.status === HttpStatus.OK) {
      setMessages(plainToInstance(UserMessage, response.data as []));
    }
  }

  async function getGroupMessagesFromUser(destination: Group) {
    const response = await getGroupMessages(destination.id);
    if (response.status === HttpStatus.OK) {
      setMessages(plainToInstance(UserMessage, response.data as []));
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
        setSelectedMessage,
        receiveMessage,
        showInfo,
        setShowInfo
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
};

export const useConversation = () => useContext(ConversationContext);
