import createValidator from 'class-validator-formik';
import { useFormik } from 'formik';
import { useInjection } from 'inversify-react';
import { useAlert } from '../contexts/AlertSnackbar';
import { useConversation } from '../contexts/Conversation';
import { CreateGroupDto } from '../dto/create-group';
import { HttpStatus } from '../enum/http-status.enum';
import { Group } from '../models/group';
import { PlainClassConverter } from '../ports/PlainClassConverter';
import { GroupService } from '../ports/services/GroupService';
import { TYPES } from '../types/InversifyTypes';

export const useCreateUpdateGroup = (
  groupId: string = '',
  handleSuccess?: (group: Group) => void
) => {
  const { setDestination, changeGroupInfo } = useConversation();
  const _groupService = useInjection<GroupService>(TYPES.GroupService);
  const _plainClassConverter = useInjection<PlainClassConverter>(
    TYPES.PlainClassConverter
  );

  const { openAlert } = useAlert();
  const form = useFormik<CreateGroupDto>({
    initialValues: { description: '', name: '' },
    validate: createValidator(CreateGroupDto),
    onSubmit: async (values) => {
      const messages = getMessages(groupId !== '');
      const { status, data } = await (groupId === ''
        ? _groupService.createGroup(values)
        : _groupService.updateGroup(groupId, values));
      if ([HttpStatus.CREATED, HttpStatus.OK].includes(status)) {
        const group = _plainClassConverter.plainToClass(Group, data);
        if (groupId === '') {
          setDestination(group);
        } else {
          changeGroupInfo(group);
        }
        openAlert({
          severity: 'success',
          message: messages.success
        });
        handleSuccess && handleSuccess(group);
      } else if (status === HttpStatus.UNPROCESSABLE_ENTITY) {
        form.setErrors(data);
        openAlert({
          severity: 'error',
          message: messages.error
        });
      }
    }
  });

  return form;
};

const getMessages = (editing: boolean) => {
  if (editing) {
    return {
      error: 'Erro ao editar grupo. Verifique os campos!',
      success: 'Grupo editado com sucesso!'
    };
  } else {
    return {
      error: 'Erro ao criar grupo. Verifique os campos!',
      success: 'Grupo criado com sucesso!'
    };
  }
};
