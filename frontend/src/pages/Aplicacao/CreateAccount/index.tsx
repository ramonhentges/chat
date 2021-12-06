import { Button, Grid, Paper, TextField, Typography } from '@material-ui/core';
import { AxiosResponse } from 'axios';
import React, { useRef, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import Footer from '../../../components/Footer';
import AlertSnackbar from '../../../components/AlertSnackbar';
import useStyles from './styles';
import { CreateUser, CreateUserError } from '../../../interfaces/create-user';
import { createUser } from '../../../services/user.service';
import { transformErrorResponse } from '../../../util/transformErrorResponse';

export function CreateAccount(props: any) {
  const classes = useStyles();
  const history = useHistory();
  const alert = useRef<any>(null);
  const success = useRef<any>(null);
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
        success.current.handleOpenMessage('Conta cadastrada com sucesso!');
        setTimeout(() => {
          if (props.location.state) {
            history.push(props.location.state.from.pathname);
          } else {
            history.push('/login');
          }
        }, 2000);
      } else {
        setError(transformErrorResponse(response.data.message));
        alert.current.handleOpenMessage(
          'Erro ao criar conta. Verifique os campos!'
        );
      }
    } else {
      setError((error) => ({
        ...error,
        password: 'As senhas não correspondem'
      }));
      alert.current.handleOpenMessage(
        'As senhas não correspondem. Verifique os campos!'
      );
    }
  }

  return (
    <div className={classes.overflow}>
      <Grid
        container
        spacing={1}
        direction="column"
        justify="center"
        alignItems="center"
        alignContent="center"
        className={classes.grid}
      >
        <Grid item lg={4} md={6} xs={8} className={classes.loginGrid}>
          <Typography
            className={classes.typography}
            variant="h2"
            color="initial"
          >
            ChatZERA
          </Typography>
          <Paper className={classes.paper}>
            <Typography className={classes.accessText} variant="h6">
              Criar Usuário
            </Typography>
            <form onSubmit={handleFormSubmit} autoComplete="off">
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

              <Button
                className={classes.button}
                variant="contained"
                color="primary"
                type="submit"
              >
                Criar
              </Button>
              <Button
                className={classes.button}
                component={Link}
                variant="contained"
                color="default"
                to="/"
              >
                Cancelar
              </Button>
            </form>
          </Paper>
        </Grid>

        <AlertSnackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          ref={alert}
          severity="error"
        />
        <AlertSnackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          ref={success}
          severity="success"
        />
        <Footer />
      </Grid>
    </div>
  );
}
