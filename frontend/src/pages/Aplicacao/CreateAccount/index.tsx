import {
  Button,
  Grid,
  Paper,
  TextField,
  Typography,
  Stack
} from '@mui/material';
import { AxiosResponse } from 'axios';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../../../components/Footer';
import { useAlert } from '../../../contexts/AlertSnackbar';
import { CreateUser, CreateUserError } from '../../../interfaces/create-user';
import { createUser } from '../../../services/user.service';

export function CreateAccount(props: any) {
  const navigate = useNavigate();
  const { openAlert } = useAlert();
  const [user, setUser] = useState<CreateUser>({
    username: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<CreateUserError>({});

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    let name = event.target.name;
    let value = event.target.value;
    setUser((user) => ({ ...user, [name]: value }));
  }
  async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (user.password === user.confirmPassword) {
      const response: AxiosResponse = await createUser(user);
      if (response.status === 201) {
        openAlert({
          severity: 'success',
          message: 'Conta cadastrada com sucesso!'
        });

        if (props.location.state) {
          navigate(props.location.state.from.pathname);
        } else {
          navigate('/login');
        }
      } else {
        setError(response.data);
        openAlert({
          severity: 'error',
          message: 'Erro ao criar conta. Verifique os campos!'
        });
      }
    } else {
      setError((error) => ({
        ...error,
        password: 'As senhas não correspondem'
      }));
      openAlert({
        severity: 'error',
        message: 'As senhas não correspondem. Verifique os campos!'
      });
    }
  }

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
              <form onSubmit={handleFormSubmit} autoComplete="off">
                <Stack direction="column" spacing={2} sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    id="fullName"
                    name="fullName"
                    label="Nome Completo"
                    variant="outlined"
                    error={!!error.fullName}
                    helperText={error?.fullName}
                    value={user.fullName}
                    onChange={handleInputChange}
                  />
                  <TextField
                    fullWidth
                    id="username"
                    name="username"
                    label="Nome de Usuário"
                    variant="outlined"
                    error={!!error.username}
                    helperText={error?.username}
                    value={user.username}
                    onChange={handleInputChange}
                  />
                  <TextField
                    fullWidth
                    id="password"
                    name="password"
                    label="Senha"
                    type="password"
                    variant="outlined"
                    error={!!error.password}
                    helperText={error?.password}
                    value={user.password}
                    onChange={handleInputChange}
                  />
                  <TextField
                    fullWidth
                    id="confirmPassword"
                    name="confirmPassword"
                    label="Confirmar Senha"
                    type="password"
                    variant="outlined"
                    error={!!error.password}
                    value={user.confirmPassword}
                    onChange={handleInputChange}
                  />
                </Stack>
                <Button
                  sx={{ marginLeft: 1, float: 'right' }}
                  variant="contained"
                  color="primary"
                  type="submit"
                >
                  Criar
                </Button>
                <Button
                  sx={{ marginLeft: 1, float: 'right' }}
                  component={Link}
                  variant="contained"
                  //@ts-ignore
                  color="default"
                  to="/"
                >
                  Cancelar
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
