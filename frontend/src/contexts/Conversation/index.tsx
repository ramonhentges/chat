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
import { PlainClassConverter } from '../../ports/PlainClassConverter';
import { GroupService } from '../../ports/services/GroupService';
import { MessageService } from '../../ports/services/MessageService';
import { SocketService } from '../../ports/services/SocketService';
import { TYPES } from '../../types/InversifyTypes';
import { useAlert } from '../AlertSnackbar';
import { useAuth } from '../Auth';
import {
  useDeleteMessage,
  useGetLastMessages,
  useJoinLeaveGroup,
  useMarkMessageAsReaded,
  useReceiveMarkedReadedMessages,
  useReceiveMessage
} from './hooks';

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
  const _groupService = useInjection<GroupService>(TYPES.GroupService);
  const _messageService = useInjection<MessageService>(TYPES.MessageService);
  const _socketService = useInjection<SocketService>(TYPES.SocketService);
  const _classConverter = useInjection<PlainClassConverter>(
    TYPES.PlainClassConverter
  );

  const { user } = useAuth();
  const { openAlert } = useAlert();

  const { receiveMessage } = useReceiveMessage(
    destination,
    user,
    setLastMessages,
    setMessages
  );

  useGetLastMessages(setLastMessages);

  useDeleteMessage(setMessages, setLastMessages);

  useReceiveMarkedReadedMessages(setMessages, setLastMessages);

  useMarkMessageAsReaded(messages);

  useJoinLeaveGroup(
    setMessages,
    setLastMessages,
    destination,
    setDestinationState
  );

  useEffect(() => {
    setSelectedMessage(undefined);
    setActualPage(ActualPage.CHAT);
  }, [destination]);

  async function setDestination(destination: Group | User) {
    if (destination instanceof Group) {
      const { status, data } = await _groupService.getGroupInfo(destination.id);
      if (status === HttpStatus.OK) {
        setDestinationState(_classConverter.plainToClass(Group, data));
      } else {
        setDestinationState(destination);
      }
    } else {
      haveMoreMessages.current = true;
      setDestinationState(destination);
    }
    setLoading(true);
    await getMessages(destination, 0);
    setLoading(false);
  }

  const sendMessage = useCallback(
    (message: string) => {
      if (destination instanceof User) {
        _socketService.sendUserMessage(destination.username, message);
      } else if (destination instanceof Group) {
        _socketService.sendGroupMessage(destination.id, message);
      }
    },
    [_socketService, destination]
  );

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
            ..._classConverter.plainToClassArray(UserMessage, data),
            ...oldMessages
          ]);
        } else {
          setMessages(_classConverter.plainToClassArray(UserMessage, data));
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
            ..._classConverter.plainToClassArray(GroupMessage, data),
            ...oldMessages
          ]);
        } else {
          setMessages(_classConverter.plainToClassArray(GroupMessage, data));
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
          _classConverter.plainToClass(Group, {
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
            return _classConverter.plainToClass(GroupMessage, {
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
