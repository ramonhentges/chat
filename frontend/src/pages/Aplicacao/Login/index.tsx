import {
  Button,
  Grid,
  Link,
  Paper,
  TextField,
  Typography,
} from "@material-ui/core";
import { AxiosResponse } from "axios";
import React, { useRef, useState } from "react";
import { Redirect, useHistory, Link as LinkDom } from "react-router-dom";
import Footer from "../../../components/Footer";
import AlertSnackbar from "../../../components/AlertSnackbar";
import { Login as LoginInterface } from "../../../interfaces/login";
import useStyles from "./styles";
import { useAuth } from "../../../contexts/Auth";

export function Login(props: any) {
  const classes = useStyles();
  const history = useHistory();
  const alert = useRef<any>(null);
  const [user, setUser] = useState<LoginInterface>({
    username: "",
    password: "",
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
      if (props.location.state) {
        history.push(props.location.state.from.pathname);
      } else {
        history.push("/");
      }
    } else {
      alert.current.handleOpenSnackbar();
    }
  }

  return signed ? (
    <Redirect
      to={{
        pathname: "/",
      }}
    />
  ) : (
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
              Acesso ao sistema
            </Typography>
            <form onSubmit={handleFormSubmit} autoComplete="off">
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
              <Button
                className={classes.button}
                variant="contained"
                color="primary"
                type="submit"
              >
                Login
              </Button>
            </form>
          </Paper>
        </Grid>
        <Grid item className={classes.createAccountGrid} lg={4} md={6} xs={8}>
          <Typography className={classes.createAccountText}>
            {"Não possui conta? "}
            <Link component={LinkDom} color="primary" to="createAccount">
              Criar conta
            </Link>
          </Typography>
        </Grid>
        <AlertSnackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          ref={alert}
          severity="error"
          message="Login inválido"
        />
        <Footer />
      </Grid>
    </div>
  );
}
