import {
  Button,
  CircularProgress,
  Grid,
  Modal,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import React, {
  ForwardedRef,
  forwardRef,
  useImperativeHandle,
  useState
} from 'react';
import { useCreateUpdateGroup } from '../../hooks/useCreateUpdateGroup';
import { Group } from '../../models/group';

const CreateGroupModal = forwardRef((props, ref: ForwardedRef<unknown>) => {
  const [open, setOpen] = useState(false);
  const [groupId, setGroupId] = useState('');

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
    errors,
    touched,
    setValues,
    resetForm
  } = useCreateUpdateGroup(groupId, handleClose);

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
