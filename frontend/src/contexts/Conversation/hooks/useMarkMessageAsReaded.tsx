import { useInjection } from 'inversify-react';
import { useEffect } from 'react';
import { IMessage } from '../../../interfaces/i-message';
import { SocketService } from '../../../ports/services/SocketService';
import { TYPES } from '../../../types/InversifyTypes';
import { useAuth } from '../../Auth';

export const useMarkMessageAsReaded = (messages: IMessage[]) => {
  const { user } = useAuth();
  const _socketService = useInjection<SocketService>(TYPES.SocketService);

  useEffect(() => {
    if (user) {
      const messagesToMark: string[] = [];
      for (const message of messages) {
        if (message.origin.getKey() !== user.getKey()) {
          if (
            !message.readedBy.some(
              (reader) => reader.user.getKey() === user.getKey()
            )
          ) {
            messagesToMark.push(message.id);
          }
        }
      }
      _socketService.markMessageAsReaded(messagesToMark);
    }
  }, [_socketService, messages, user]);
};
