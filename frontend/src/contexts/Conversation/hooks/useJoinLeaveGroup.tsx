import { useInjection } from 'inversify-react';
import { useEffect } from 'react';
import { IMessage } from '../../../interfaces/i-message';
import { Group } from '../../../models/group';
import { User } from '../../../models/user';
import { PlainClassConverter } from '../../../ports/PlainClassConverter';
import { MessageService } from '../../../ports/services/MessageService';
import { SocketService } from '../../../ports/services/SocketService';
import { TYPES } from '../../../types/InversifyTypes';
import { useAlert } from '../../AlertSnackbar';
import { getGroupLastMessage } from '../helpers/getGroupMessage';

export const useJoinLeaveGroup = (
  setMessages: React.Dispatch<React.SetStateAction<IMessage[]>>,
  setLastMessages: React.Dispatch<React.SetStateAction<IMessage[]>>,
  destination: User | Group | null,
  setDestinationState: React.Dispatch<React.SetStateAction<User | Group | null>>
) => {
  const { openAlert } = useAlert();
  const _messageService = useInjection<MessageService>(TYPES.MessageService);
  const _socketService = useInjection<SocketService>(TYPES.SocketService);
  const _classConverter = useInjection<PlainClassConverter>(
    TYPES.PlainClassConverter
  );

  useEffect(() => {
    _socketService.addListner('joinedGroup', async (group: Group) => {
      const groupLastMessage = await getGroupLastMessage(
        group,
        _messageService,
        _classConverter
      );
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

    _socketService.addListner('leavedGroup', (group: Group) => {
      const groupClass = _classConverter.plainToClass(Group, group);
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

    return () => {
      _socketService.removeListner('joinedGroup');
      _socketService.removeListner('leavedGroup');
    };
  }, [
    openAlert,
    destination,
    setDestinationState,
    setLastMessages,
    setMessages,
    _messageService,
    _socketService,
    _classConverter
  ]);
};
