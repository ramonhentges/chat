import {
  Button,
  Grid,
  Paper,
  TextField,
  Typography,
  Stack,
  CircularProgress
} from '@mui/material';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../../../components/Footer';
import { useAlert } from '../../../contexts/AlertSnackbar';
import { HttpStatus } from '../../../enum/http-status.enum';
import { CreateUserDto } from '../../../dto/create-user';
import { useFormik } from 'formik';
import createValidator from 'class-validator-formik';
import { container } from '../../../config/inversify.config';
import { UserService } from '../../../services/UserService';
import { SERVICE_TYPES } from '../../../types/Service';

export function CreateAccount() {
  const navigate = useNavigate();
  const { openAlert } = useAlert();
  const _userService = container.get<UserService>(SERVICE_TYPES.UserService);

  const {
    values,
    handleChange,
    handleSubmit,
    handleBlur,
    isSubmitting,
    setErrors,
    errors,
    touched
  } = useFormik<CreateUserDto>({
    initialValues: new CreateUserDto(),
    validate: createValidator(CreateUserDto),
    onSubmit: async (values) => {
      if (values.password === values.confirmPassword) {
        const { status, data } = await _userService.createUser(values);
        if (status === HttpStatus.CREATED) {
          openAlert({
            severity: 'success',
            message: 'Conta cadastrada com sucesso!'
          });
          navigate('/login');
        } else {
          setErrors(data);
          openAlert({
            severity: 'error',
            message: 'Erro ao criar conta. Verifique os campos!'
          });
        }
      } else {
        setErrors({
          password: 'As senhas não correspondem',
          confirmPassword: ' '
        });
        openAlert({
          severity: 'error',
          message: 'As senhas não correspondem. Verifique os campos!'
        });
      }
    }
  });

  return (
    <div style={{ overflowX: 'hidden', overflowY: 'hidden' }}>
      <Grid
        container
        spacing={1}
        direction="column"
        justifyContent="center"
        alignItems="center"
        alignContent="center"
        sx={{ minHeight: '100vh' }}
      >
        <Grid item>
          <Typography sx={{ p: 2, textAlign: 'center' }} variant="h2">
            Chatting
          </Typography>
        </Grid>
        <Grid item container justifyContent="center">
          <Grid item lg={6} md={8} xs={12}>
            <Paper sx={{ padding: 2, margin: 'auto' }}>
              <Typography sx={{ mb: 2 }} variant="h6">
                Criar Usuário
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
                    name="username"
                    label="Nome de Usuário"
                    variant="outlined"
                    error={touched.username && Boolean(errors.username)}
                    helperText={touched.username && errors.username}
                    value={values.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
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
                    error={
                      touched.confirmPassword && Boolean(errors.confirmPassword)
                    }
                    helperText={
                      touched.confirmPassword && errors.confirmPassword
                    }
                    value={values.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </Stack>
                <Button
                  sx={{ marginLeft: 1, float: 'right' }}
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <CircularProgress size="1.5rem" /> : 'Criar'}
                </Button>
                <Button
                  sx={{ marginLeft: 1, float: 'right' }}
                  component={Link}
                  variant="contained"
                  color="default"
                  to="/"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <CircularProgress size="1.5rem" />
                  ) : (
                    'Cancelar'
                  )}
                </Button>
              </form>
            </Paper>
          </Grid>
        </Grid>

        <Grid item>
          <Footer />
        </Grid>
      </Grid>
    </div>
  );
}
