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
import { useAlert } from '../AlertSnackbar';
import { QueryFilter } from '../../interfaces/query';

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
  receiveMessage: (message: UserMessage | GroupMessage) => void;
  getMoreMessages: () => Promise<void>;
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
  const { openAlert } = useAlert();

  const getGroupLastMessage = useCallback(async (group: Group) => {
    const message = await getLastGroupMessage(group.id);
    if (message.status === HttpStatus.OK) {
      let data;
      if (message.data) {
        data = { ...message.data, groupDestination: group };
      } else {
        data = {
          id: group.id,
          message: 'Grupo Criado',
          deleted: false,
          createdAt: group.createdAt,
          origin: new User(),
          groupDestination: group
        };
      }
      return plainToInstance(GroupMessage, data);
    }
  }, []);

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
              return getGroupLastMessage(group);
            }
          );
          Promise.all(latestGroupsMessages).then((groupMessages) => {
            const userMessages = plainToInstance(
              UserMessage,
              latestUserMessages.data as []
            );
            setLastMessages(
              [...groupMessages, ...userMessages].sort(sortLastMessages)
            );
          });
        }
      }
    }
    getLastMessages();
  }, [user, getGroupLastMessage]);

  const receiveMessage = useCallback(
    (message: UserMessage | GroupMessage) => {
      if (user) {
        setLastMessages((messages) => {
          return [
            message,
            ...messages.filter(
              (m) =>
                m.getContact(user).getKey() !==
                message.getContact(user).getKey()
            )
          ];
        });
      }

      if (destination && user) {
        if (destination.getKey() === message.getContact(user).getKey()) {
          setMessages((oldMsgs) => [...oldMsgs, message]);
        }
      }
    },
    [destination, user]
  );

  const deleteMessage = (deletedMessage: UserMessage | GroupMessage) => {
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
      receiveMessage(plainToInstance(UserMessage, message));
    });

    socket.off('msgFromUser');
    socket.on('msgFromUser', (message: UserMessage) => {
      receiveMessage(plainToInstance(UserMessage, message));
    });
    socket.off('msgFromGroup');
    socket.on('msgFromGroup', (message: GroupMessage) => {
      receiveMessage(plainToInstance(GroupMessage, message));
    });
  }, [receiveMessage]);

  useEffect(() => {
    socket.off('deletedUserMessage');
    socket.on('deletedUserMessage', (message: UserMessage) => {
      deleteMessage(plainToInstance(UserMessage, { ...message, message: '' }));
    });
    socket.off('deletedGroupMessage');
    socket.on('deletedGroupMessage', (message: GroupMessage) => {
      deleteMessage(plainToInstance(GroupMessage, { ...message, message: '' }));
    });
  }, []);

  useEffect(() => {
    socket.off('joinedGroup');
    socket.on('joinedGroup', async (group: Group) => {
      const groupLastMessage = await getGroupLastMessage(group);
      if (groupLastMessage) {
        setLastMessages((messages) => [groupLastMessage, ...messages]);
        openAlert({
          severity: 'info',
          message: `Você foi adicionado ao grupo ${groupLastMessage
            .destination()
            .getTitle()}`
        });
      }
    });
    socket.off('leavedGroup');
    socket.on('leavedGroup', (group: Group) => {
      const groupClass = plainToInstance(Group, group);
      setLastMessages((messages) =>
        messages.filter(
          (message) => message.destination().getKey() !== groupClass.getKey()
        )
      );
      if (destination?.getKey() === groupClass.getKey()) {
        setDestinationState(null);
        setMessages([]);
      }
      openAlert({
        severity: 'info',
        message: `Você foi removido do grupo ${groupClass.getTitle()}`
      });
    });
  }, [getGroupLastMessage, openAlert, destination]);

  useEffect(() => {
    setSelectedMessage(undefined);
    setShowInfo(false);
  }, [destination]);

  async function setDestination(destination: Group | User) {
    setDestinationState(destination);
    setLoading(true);
    await getMessages(destination, 0);
    setLoading(false);
  }

  function sendMessage(message: string) {
    if (destination instanceof User) {
      sendUserMessage(destination.username, message);
    } else if (destination instanceof Group) {
      sendGroupMessage(destination.id, message);
    }
  }

  async function getMessages(destination: Group | User, skip: number) {
    if (destination instanceof User) {
      await getMessagesFromUser(destination, skip);
    } else if (destination instanceof Group) {
      await getGroupMessagesFromUser(destination, skip);
    }
  }

  async function getMoreMessages() {
    if (destination instanceof User) {
      await getMessagesFromUser(destination, messages.length);
    } else if (destination instanceof Group) {
      await getGroupMessagesFromUser(destination, messages.length);
    }
  }

  async function getMessagesFromUser(destination: User, skip: number) {
    const response = await getUserMessages(
      destination,
      new QueryFilter(20, skip)
    );
    if (response.status === HttpStatus.OK) {
      if (skip > 0) {
        setMessages((oldMessages) => [
          ...plainToInstance(UserMessage, response.data as []),
          ...oldMessages
        ]);
      } else {
        setMessages(plainToInstance(UserMessage, response.data as []));
      }
    }
  }

  async function getGroupMessagesFromUser(destination: Group, skip: number) {
    const response = await getGroupMessages(
      destination.id,
      new QueryFilter(20, skip)
    );
    if (response.status === HttpStatus.OK) {
      setMessages(plainToInstance(GroupMessage, response.data as []));
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
        setShowInfo,
        getMoreMessages
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
};

export const useConversation = () => useContext(ConversationContext);
