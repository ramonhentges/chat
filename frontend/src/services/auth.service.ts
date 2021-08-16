import { Login } from "../interfaces/login";
import { api } from "./api";

const login = (usuario: Login) => {
  return api.post("auth/login", usuario)
    .then((response) => {
      return response;
    })
    .catch((err) => {
      return err.response;
    });
};

export { login };
