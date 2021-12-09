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
import { ICreateGroup } from '../../interfaces/create-group';
import { createGroup } from '../../services/group.service';
import { HttpStatus } from '../../enum/http-status.enum';
import { plainToInstance } from 'class-transformer';
import { Group } from '../../models/group';
import { useAlert } from '../../contexts/AlertSnackbar';
import { useConversation } from '../../contexts/Conversation';

const CreateGroupModal = forwardRef((props, ref: ForwardedRef<unknown>) => {
  const [open, setOpen] = useState(false);
  const { setDestination } = useConversation();

  const { openAlert } = useAlert();

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
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
    touched
  } = useFormik<ICreateGroup>({
    initialValues: { description: '', name: '' },
    onSubmit: async (values) => {
      const { status, data } = await createGroup(values);
      if (status === HttpStatus.CREATED) {
        const group = plainToInstance(Group, data);
        setDestination(group);
        openAlert({
          severity: 'success',
          message: 'Grupo criado com sucesso!'
        });
        handleClose();
      } else if (status === HttpStatus.UNPROCESSABLE_ENTITY) {
        setErrors(data);
        openAlert({
          severity: 'error',
          message: 'Erro ao criar o grupo. Verifique os dados!'
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
              <Typography variant="h5">Criar Grupo</Typography>
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
                  {isSubmitting ? <CircularProgress size="1.5rem" /> : 'Criar'}
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
