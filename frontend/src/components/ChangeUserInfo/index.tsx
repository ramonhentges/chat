import {
  Button,
  TextField,
  Typography,
  Stack,
  CircularProgress,
  Grid
} from '@mui/material';
import React from 'react';
import { useFormik } from 'formik';
import { useAlert } from '../../contexts/AlertSnackbar';
import { useAuth } from '../../contexts/Auth';
import { HttpStatus } from '../../enum/http-status.enum';
import { UpdateUserDto } from '../../dto/update-user';
import { updateUser } from '../../services/user.service';
import { ActualPage } from '../../enum/actual-page';
import { useConversation } from '../../contexts/Conversation';

export function ChangeUserInfo(props: any) {
  const { user, refreshUserInfo } = useAuth();
  const { openAlert } = useAlert();
  const { setActualPage } = useConversation();
  const {
    values,
    handleChange,
    handleSubmit,
    handleBlur,
    isSubmitting,
    setErrors,
    errors,
    touched
  } = useFormik<UpdateUserDto>({
    initialValues: {
      fullName: user?.fullName || '',
      password: '',
      confirmPassword: ''
    },
    onSubmit: async (values) => {
      if (values.password === values.confirmPassword) {
        if (values.password === '') {
          delete values.password;
        }
        const { status, data } = await updateUser(values);
        if (status === HttpStatus.OK) {
          openAlert({
            severity: 'success',
            message: 'Usuário editado com sucesso!'
          });
          refreshUserInfo();
          setActualPage(ActualPage.CHAT);
        } else if (status === HttpStatus.UNPROCESSABLE_ENTITY) {
          console.log(data);
          setErrors(data);
          openAlert({
            severity: 'error',
            message: 'Erro ao editar o usuário. Verifique os dados!'
          });
        }
      } else {
        setErrors({
          password: 'As senhas não correspondem'
        });
        openAlert({
          severity: 'error',
          message: 'As senhas não correspondem. Verifique os campos!'
        });
      }
    }
  });

  return (
    <Grid
      item
      sx={{ p: 2 }}
      style={{ overflowX: 'hidden', overflowY: 'hidden' }}
    >
      <Typography sx={{ mb: 2 }} variant="h6">
        Meus Dados
      </Typography>
      <form onSubmit={handleSubmit} autoComplete="off">
        <Stack direction="column" spacing={2} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            id="fullName"
            name="fullName"
            label="Nome Completo"
            variant="outlined"
            error={touched.fullName && Boolean(errors.fullName)}
            helperText={touched.fullName && errors.fullName}
            value={values.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          <TextField
            fullWidth
            id="username"
            disabled
            name="username"
            label="Nome de Usuário"
            variant="outlined"
            value={user?.username}
          />
          <TextField
            fullWidth
            id="password"
            name="password"
            label="Senha"
            type="password"
            variant="outlined"
            error={touched.password && Boolean(errors.password)}
            helperText={touched.password && errors.password}
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          <TextField
            fullWidth
            id="confirmPassword"
            name="confirmPassword"
            label="Confirmar Senha"
            type="password"
            variant="outlined"
            error={touched.confirmPassword && Boolean(errors.confirmPassword)}
            helperText={touched.confirmPassword && errors.confirmPassword}
            value={values.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </Stack>
        <Stack direction="row" spacing={2} justifyContent="right">
          <Button
            variant="contained"
            color="default"
            onClick={() => setActualPage(ActualPage.CHAT)}
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size="1.5rem" /> : 'Voltar'}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleSubmit()}
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size="1.5rem" /> : 'Salvar'}
          </Button>
        </Stack>
      </form>
    </Grid>
  );
}
