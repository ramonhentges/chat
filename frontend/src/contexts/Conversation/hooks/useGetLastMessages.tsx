import { useInjection } from 'inversify-react';
import { useEffect } from 'react';
import { HttpStatus } from '../../../enum/http-status.enum';
import { IMessage } from '../../../interfaces/i-message';
import { Group } from '../../../models/group';
import { UserMessage } from '../../../models/user-message';
import { PlainClassConverter } from '../../../ports/PlainClassConverter';
import { GroupService } from '../../../ports/services/GroupService';
import { MessageService } from '../../../ports/services/MessageService';
import { TYPES } from '../../../types/InversifyTypes';

import { useAuth } from '../../Auth';
import { getGroupLastMessage } from '../helpers/getGroupMessage';
import { sortLastMessages } from '../helpers/sortLastMessages';

export const useGetLastMessages = (
  setLastMessages: React.Dispatch<React.SetStateAction<IMessage[]>>
) => {
  const _messageService = useInjection<MessageService>(TYPES.MessageService);
  const _groupService = useInjection<GroupService>(TYPES.GroupService);
  const _classConverter = useInjection<PlainClassConverter>(
    TYPES.PlainClassConverter
  );
  const { user } = useAuth();

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
              return getGroupLastMessage(
                group,
                _messageService,
                _classConverter
              );
            }
          );
          Promise.all(latestGroupsMessages).then((groupMessages) => {
            const userMessages = _classConverter.plainToClassArray(
              UserMessage,
              latestUserMessages.data
            );
            setLastMessages(
              [...groupMessages, ...userMessages].sort(sortLastMessages)
            );
          });
        }
      }
    }
    getLastMessages();
  }, [user, setLastMessages, _messageService, _groupService, _classConverter]);
};
