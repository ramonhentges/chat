import { HttpStatus } from '../../../enum/http-status.enum';
import { Group } from '../../../models/group';
import { GroupMessage } from '../../../models/group-message';
import { User } from '../../../models/user';
import { PlainClassConverter } from '../../../ports/PlainClassConverter';
import { MessageService } from '../../../ports/services/MessageService';

export const getGroupLastMessage = async (
  group: Group,
  messageService: MessageService,
  classConverter: PlainClassConverter
) => {
  const message = await messageService.getLastGroupMessage(group.id);
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
    return classConverter.plainToClass(GroupMessage, data);
  }
};
