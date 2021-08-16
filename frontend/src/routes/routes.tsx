import { Redirect, Route, RouteProps, Router, Switch } from "react-router-dom";
import { createBrowserHistory } from "history";
import React from "react";
import { Login } from "../pages/Aplicacao/Login";
import InitialPage from "../pages/Aplicacao/InitialPage";
import GridTest from "../pages/Aplicacao/GridTest";
import { useAuth } from "../contexts/Auth";
import { CreateAccount } from "../pages/Aplicacao/CreateAccount";

const history = createBrowserHistory();

interface IPrivateRouteProps extends RouteProps {
  component: React.ComponentType<any>;
}

const Routes: React.FC = () => {
  const { signed, loading } = useAuth();
  const PrivateRoute = ({
    component: Component,
    ...rest
  }: IPrivateRouteProps) => (
    <Route
      {...rest}
      render={(props) =>
        signed ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: props.location },
            }}
          />
        )
      }
    />
  );
  return loading ? (
    <h1> Loading... </h1>
  ) : (
    <Router history={history}>
      <Switch>
        <Route exact path="/login" component={Login} />
        <PrivateRoute component={InitialPage} path="/" exact />
        <Route exact path="/createAccount" component={CreateAccount} />
        <Route exact path="/grid" component={GridTest} />
      </Switch>
    </Router>
  );
};

export default Routes;
