import { plainToInstance } from 'class-transformer';
import { useInjection } from 'inversify-react';
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';
import { MESSAGES_TO_TAKE } from '../../constants/message';
import { ActualPage } from '../../enum/actual-page';
import { HttpStatus } from '../../enum/http-status.enum';
import { IMessage } from '../../interfaces/i-message';
import { QueryFilter } from '../../interfaces/query';
import { Group } from '../../models/group';
import { GroupMessage } from '../../models/group-message';
import { User } from '../../models/user';
import { UserMessage } from '../../models/user-message';
import { GroupService } from '../../ports/services/GroupService';
import { MessageService } from '../../ports/services/MessageService';
import { SocketService } from '../../ports/services/SocketService';
import { SERVICE_TYPES } from '../../types/Service';
import { useAlert } from '../AlertSnackbar';
import { useAuth } from '../Auth';

interface ConversationContextProps {
  destination: Group | User | null;
  setDestination: (destination: Group | User) => void;
  loading: boolean;
  messages: IMessage[];
  sendMessage: (message: string) => void;
  lastMessages: IMessage[];
  selectedMessage: IMessage | undefined;
  setSelectedMessage: (message: IMessage | undefined) => void;
  actualPage: ActualPage;
  setActualPage: (page: ActualPage) => void;
  receiveMessage: (message: IMessage) => void;
  getMoreMessages: () => Promise<void>;
  changeGroupInfo: (group: Group) => void;
}

const sortLastMessages = (a: IMessage, b: IMessage): number => {
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
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [lastMessages, setLastMessages] = useState<IMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<
    IMessage | undefined
  >();
  const [actualPage, setActualPage] = useState<ActualPage>(ActualPage.CHAT);
  const haveMoreMessages = useRef<boolean>(true);
  const _groupService = useInjection<GroupService>(SERVICE_TYPES.GroupService);
  const _messageService = useInjection<MessageService>(
    SERVICE_TYPES.MessageService
  );
  const _socketService = useInjection<SocketService>(SERVICE_TYPES.SocketService);

  const { user } = useAuth();
  const { openAlert } = useAlert();

  const getGroupLastMessage = useCallback(
    async (group: Group) => {
      const message = await _messageService.getLastGroupMessage(group.id);
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
    },
    [_messageService]
  );

  useEffect(() => {
    async function getLastMessages() {
      if (user) {
        const latestUserMessages = await _messageService.getLatestMessages();
        const myGroups = await _groupService.getMyGroups();
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
  }, [user, getGroupLastMessage, _messageService, _groupService]);

  const receiveMessage = useCallback(
    (message: IMessage) => {
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

  const deleteMessage = (deletedMessage: IMessage) => {
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
    _socketService.removeListner('sendedMsgFromUser');
    _socketService.addListner('sendedMsgFromUser', (message: UserMessage) => {
      receiveMessage(plainToInstance(UserMessage, message));
    });

    _socketService.removeListner('msgFromUser');
    _socketService.addListner('msgFromUser', (message: UserMessage) => {
      receiveMessage(plainToInstance(UserMessage, message));
    });
    _socketService.removeListner('msgFromGroup');
    _socketService.addListner('msgFromGroup', (message: GroupMessage) => {
      receiveMessage(plainToInstance(GroupMessage, message));
    });
  }, [receiveMessage, _socketService]);

  useEffect(() => {
    _socketService.removeListner('deletedUserMessage');
    _socketService.addListner('deletedUserMessage', (message: UserMessage) => {
      deleteMessage(plainToInstance(UserMessage, { ...message, message: '' }));
    });
    _socketService.removeListner('deletedGroupMessage');
    _socketService.addListner('deletedGroupMessage', (message: GroupMessage) => {
      deleteMessage(plainToInstance(GroupMessage, { ...message, message: '' }));
    });
  }, [_socketService]);

  useEffect(() => {
    _socketService.removeListner('joinedGroup');
    _socketService.addListner('joinedGroup', async (group: Group) => {
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
    _socketService.removeListner('leavedGroup');
    _socketService.addListner('leavedGroup', (group: Group) => {
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
  }, [getGroupLastMessage, openAlert, destination, _socketService]);

  useEffect(() => {
    setSelectedMessage(undefined);
    setActualPage(ActualPage.CHAT);
  }, [destination]);

  async function setDestination(destination: Group | User) {
    haveMoreMessages.current = true;
    setDestinationState(destination);
    setLoading(true);
    await getMessages(destination, 0);
    setLoading(false);
  }

  function sendMessage(message: string) {
    if (destination instanceof User) {
      _socketService.sendUserMessage(destination.username, message);
    } else if (destination instanceof Group) {
      _socketService.sendGroupMessage(destination.id, message);
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
    if (haveMoreMessages.current) {
      if (destination instanceof User) {
        await getMessagesFromUser(destination, messages.length);
      } else if (destination instanceof Group) {
        await getGroupMessagesFromUser(destination, messages.length);
      }
    }
  }

  async function getMessagesFromUser(destination: User, skip: number) {
    const { status, data } = await _messageService.getUserMessages(
      destination,
      new QueryFilter(MESSAGES_TO_TAKE, skip)
    );
    if (status === HttpStatus.OK) {
      if (data.length > 0 || skip === 0) {
        if (skip > 0) {
          setMessages((oldMessages) => [
            ...plainToInstance(UserMessage, data as []),
            ...oldMessages
          ]);
        } else {
          setMessages(plainToInstance(UserMessage, data as []));
        }
      } else {
        openAlert({
          severity: 'info',
          message: 'Você chegou ao início da conversa!'
        });
        haveMoreMessages.current = false;
      }
    }
  }

  async function getGroupMessagesFromUser(destination: Group, skip: number) {
    const { status, data } = await _messageService.getGroupMessages(
      destination.id,
      new QueryFilter(MESSAGES_TO_TAKE, skip)
    );
    if (status === HttpStatus.OK) {
      if (data.length > 0 || skip === 0) {
        if (skip > 0) {
          setMessages((oldMessages) => [
            ...plainToInstance(GroupMessage, data as []),
            ...oldMessages
          ]);
        } else {
          setMessages(plainToInstance(GroupMessage, data as []));
        }
      } else {
        openAlert({
          severity: 'info',
          message: 'Você chegou ao início da conversa!'
        });
        haveMoreMessages.current = false;
      }
    }
  }

  function changeGroupInfo(group: Group) {
    if (destination instanceof Group) {
      if (destination.id === group.id) {
        setDestination(
          plainToInstance(Group, {
            ...destination,
            name: group.name,
            description: group.description
          })
        );
      }
    }
    setLastMessages((messages) =>
      messages.map((message) => {
        if (message instanceof GroupMessage) {
          if (message.groupDestination.id === group.id) {
            return plainToInstance(GroupMessage, {
              ...message,
              groupDestination: {
                ...message.groupDestination,
                name: group.name,
                description: group.description
              }
            });
          }
        }
        return message;
      })
    );
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
        actualPage: actualPage,
        setActualPage: setActualPage,
        getMoreMessages,
        changeGroupInfo
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
};

export const useConversation = () => useContext(ConversationContext);
