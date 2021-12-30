import {
  Modal,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Stack,
  Grid,
  Typography
} from '@mui/material';
import React, {
  ForwardedRef,
  forwardRef,
  useImperativeHandle,
  useState
} from 'react';
import { useFormik } from 'formik';
import { CreateGroupDto } from '../../dto/create-group';
import { HttpStatus } from '../../enum/http-status.enum';
import { plainToInstance } from 'class-transformer';
import { Group } from '../../models/group';
import { useAlert } from '../../contexts/AlertSnackbar';
import { useConversation } from '../../contexts/Conversation';
import createValidator from 'class-validator-formik';
import { container } from '../../config/inversify.config';
import { GroupService } from '../../services/GroupService';
import { SERVICE_TYPES } from '../../types/Service';

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

const CreateGroupModal = forwardRef((props, ref: ForwardedRef<unknown>) => {
  const [open, setOpen] = useState(false);
  const [groupId, setGroupId] = useState('');
  const { setDestination, changeGroupInfo } = useConversation();
  const _groupService = container.get<GroupService>(SERVICE_TYPES.GroupService)

  const { openAlert } = useAlert();

  const handleOpen = (group?: Group) => {
    if (group) {
      setGroupId(group.id);
      setValues({ description: group.description, name: group.name });
    }
    setOpen(true);
  };

  const handleClose = () => {
    resetForm();
    setGroupId('');
    setOpen(false);
  };

  useImperativeHandle(ref, () => {
    return {
      handleOpen: handleOpen
    };
  });

  const {
    values,
    handleChange,
    handleSubmit,
    handleBlur,
    isSubmitting,
    setErrors,
    errors,
    touched,
    setValues,
    resetForm
  } = useFormik<CreateGroupDto>({
    initialValues: { description: '', name: '' },
    validate: createValidator(CreateGroupDto),
    onSubmit: async (values) => {
      const messages = getMessages(groupId !== '');
      const { status, data } = await (groupId === ''
        ? _groupService.createGroup(values)
        : _groupService.updateGroup(groupId, values));
      if ([HttpStatus.CREATED, HttpStatus.OK].includes(status)) {
        const group = plainToInstance(Group, data);
        if (groupId === '') {
          setDestination(group);
        } else {
          changeGroupInfo(group);
        }
        openAlert({
          severity: 'success',
          message: messages.success
        });
        handleClose();
      } else if (status === HttpStatus.UNPROCESSABLE_ENTITY) {
        setErrors(data);
        openAlert({
          severity: 'error',
          message: messages.error
        });
      }
    }
  });

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="group create"
      aria-describedby="modal to create group"
    >
      <Grid
        container
        justifyContent="center"
        alignContent="center"
        alignItems="center"
        style={{ height: '100vh' }}
      >
        <Grid item md={6} sm={8} xs={12}>
          <Paper sx={{ p: 2 }}>
            <Stack spacing={2} sx={{ mb: 2 }}>
              <Typography variant="h5">
                {groupId === '' ? 'Criar Grupo' : 'Editar Grupo'}
              </Typography>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Nome"
                variant="outlined"
                error={touched.name && Boolean(errors.name)}
                helperText={touched.name && errors.name}
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Descrição"
                variant="outlined"
                error={touched.description && Boolean(errors.description)}
                helperText={touched.description && errors.description}
                value={values.description}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </Stack>
            <Grid item container justifyContent="right">
              <Stack spacing={2} direction="row">
                <Button
                  variant="contained"
                  color="default"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <CircularProgress size="1.5rem" /> : 'Fechar'}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleSubmit()}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <CircularProgress size="1.5rem" />
                  ) : groupId === '' ? (
                    'Criar'
                  ) : (
                    'Editar'
                  )}
                </Button>
              </Stack>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Modal>
  );
});

export default CreateGroupModal;
