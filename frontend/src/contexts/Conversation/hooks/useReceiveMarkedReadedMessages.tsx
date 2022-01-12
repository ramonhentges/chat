import { useInjection } from 'inversify-react';
import { useEffect } from 'react';
import { IMessage } from '../../../interfaces/i-message';
import { ReadedBy } from '../../../models/readed-by.model';
import { PlainClassConverter } from '../../../ports/PlainClassConverter';
import { SocketService } from '../../../ports/services/SocketService';
import { TYPES } from '../../../types/InversifyTypes';

export const useReceiveMarkedReadedMessages = (
  setMessages: React.Dispatch<React.SetStateAction<IMessage[]>>,
  setLastMessages: React.Dispatch<React.SetStateAction<IMessage[]>>
) => {
  const _socketService = useInjection<SocketService>(TYPES.SocketService);
  const _classConverter = useInjection<PlainClassConverter>(
    TYPES.PlainClassConverter
  );

  useEffect(() => {
    const markAsReaded = (readedBy: ReadedBy) => {
      setMessages((prevMessages) =>
        prevMessages.map((message) => markMessageAsReaded(message, readedBy))
      );
      setLastMessages((prevMessages) =>
        prevMessages.map((message) => markMessageAsReaded(message, readedBy))
      );
    };
    _socketService.addListner('markAsReaded', (readedBy: ReadedBy) => {
      markAsReaded(_classConverter.plainToClass(ReadedBy, readedBy));
    });

    return () => {
      _socketService.removeListner('markAsReaded');
    };
  }, [setMessages, setLastMessages, _socketService, _classConverter]);
};

function markMessageAsReaded(message: IMessage, readedBy: ReadedBy) {
  if (message.id === readedBy.message.id) {
    message.readedBy.push(readedBy);
  }
  return message;
}
