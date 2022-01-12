import { useInjection } from 'inversify-react';
import { useEffect } from 'react';
import { IMessage } from '../../../interfaces/i-message';
import { GroupMessage } from '../../../models/group-message';
import { UserMessage } from '../../../models/user-message';
import { PlainClassConverter } from '../../../ports/PlainClassConverter';
import { SocketService } from '../../../ports/services/SocketService';
import { TYPES } from '../../../types/InversifyTypes';

export const useDeleteMessage = (
  setMessages: React.Dispatch<React.SetStateAction<IMessage[]>>,
  setLastMessages: React.Dispatch<React.SetStateAction<IMessage[]>>
) => {
  const _socketService = useInjection<SocketService>(
    TYPES.SocketService
  );
  const _classConverter = useInjection<PlainClassConverter>(
    TYPES.PlainClassConverter
  );

  useEffect(() => {
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
    _socketService.addListner('deletedUserMessage', (message: UserMessage) => {
      deleteMessage(
        _classConverter.plainToClass(UserMessage, { ...message, message: '' })
      );
    });
    _socketService.addListner(
      'deletedGroupMessage',
      (message: GroupMessage) => {
        deleteMessage(
          _classConverter.plainToClass(GroupMessage, {
            ...message,
            message: ''
          })
        );
      }
    );

    return () => {
      _socketService.removeListner('deletedUserMessage');
      _socketService.removeListner('deletedGroupMessage');
    };
  }, [setMessages, setLastMessages, _socketService, _classConverter]);
};
