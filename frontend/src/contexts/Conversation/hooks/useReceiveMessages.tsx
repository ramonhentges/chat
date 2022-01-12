import { useInjection } from 'inversify-react';
import { useCallback, useEffect } from 'react';
import { IMessage } from '../../../interfaces/i-message';
import { Group } from '../../../models/group';
import { GroupMessage } from '../../../models/group-message';
import { User } from '../../../models/user';
import { UserMessage } from '../../../models/user-message';
import { PlainClassConverter } from '../../../ports/PlainClassConverter';
import { SocketService } from '../../../ports/services/SocketService';
import { TYPES } from '../../../types/InversifyTypes';
import { playNotificationSound } from '../../../util/notification-sound';

export const useReceiveMessage = (
  destination: User | Group | null,
  user: User | null,
  setLastMessages: React.Dispatch<React.SetStateAction<IMessage[]>>,
  setMessages: React.Dispatch<React.SetStateAction<IMessage[]>>
) => {
  const _socketService = useInjection<SocketService>(TYPES.SocketService);
  const _classConverter = useInjection<PlainClassConverter>(
    TYPES.PlainClassConverter
  );

  const receiveMessage = useCallback(
    (message: IMessage) => {
      if (user?.getKey() !== message.origin.getKey()) {
        playNotificationSound();
      }
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
          setMessages((oldMsgs: any) => [...oldMsgs, message]);
        }
      }
    },
    [destination, user, setLastMessages, setMessages]
  );

  useEffect(() => {
    _socketService.addListner('sendedMsgFromUser', (message: UserMessage) => {
      receiveMessage(_classConverter.plainToClass(UserMessage, message));
    });
    _socketService.addListner('msgFromUser', (message: UserMessage) => {
      receiveMessage(_classConverter.plainToClass(UserMessage, message));
    });
    _socketService.addListner('msgFromGroup', (message: GroupMessage) => {
      receiveMessage(_classConverter.plainToClass(GroupMessage, message));
    });

    return () => {
      _socketService.removeListner('msgFromGroup');
      _socketService.removeListner('msgFromUser');
      _socketService.removeListner('sendedMsgFromUser');
    };
  }, [receiveMessage, _socketService, _classConverter]);

  return { receiveMessage };
};
