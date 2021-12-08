import {
  Button,
  Grid,
  Link,
  Paper,
  TextField,
  Typography,
  Container,
  Stack
} from '@mui/material';
import React, { useState } from 'react';
import { Navigate, useNavigate, Link as LinkDom } from 'react-router-dom';
import Footer from '../../../components/Footer';
import { Login as LoginInterface } from '../../../interfaces/login';
import { useAuth } from '../../../contexts/Auth';
import { useAlert } from '../../../contexts/AlertSnackbar';

export function Login(props: any) {
  const navigate = useNavigate();
  const { openAlert } = useAlert();
  const [user, setUser] = useState<LoginInterface>({
    username: '',
    password: ''
  });
  const { signed, signIn } = useAuth();

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    let name = event.target.name;
    let value = event.target.value;
    setUser((user) => ({ ...user, [name]: value }));
  }
  async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await signIn(user)) {
      navigate('/');
    } else {
      openAlert({
        severity: 'error',
        message: 'Usuário e/ou senha incorreto(s)'
      });
    }
  }

  return signed ? (
    <Navigate
      to={{
        pathname: '/'
      }}
    />
  ) : (
    <Container maxWidth="sm">
      <Grid
        container
        spacing={1}
        direction="column"
        justifyContent="center"
        alignItems="center"
        alignContent="center"
        sx={{ minHeight: '100vh' }}
      >
        <Grid
          item
          container
          direction="column"
          sx={{ width: '100%' }}
          spacing={2}
        >
          <Grid item>
            <Typography sx={{ textAlign: 'center' }} variant="h2">
              Chatting
            </Typography>
          </Grid>
          <Grid item>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Acesso ao sistema
              </Typography>
              <form onSubmit={handleFormSubmit} autoComplete="off">
                <Stack direction="column" spacing={2} sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    id="username"
                    name="username"
                    label="Nome de Usuário"
                    variant="outlined"
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
                    value={user.password}
                    onChange={handleInputChange}
                  />
                </Stack>
                <Button
                  sx={{ float: 'right' }}
                  variant="contained"
                  color="primary"
                  type="submit"
                >
                  Login
                </Button>
              </form>
            </Paper>
          </Grid>
        </Grid>
        <Grid item container justifyContent="flex-end">
          <Typography sx={{ float: 'right', mr: 1 }}>
            {'Não possui conta? '}
            <Link component={LinkDom} color="primary" to="/createAccount">
              Criar conta
            </Link>
          </Typography>
        </Grid>

        <Footer />
      </Grid>
    </Container>
  );
}
