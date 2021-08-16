export interface CreateUser {
  fullName: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface CreateUserError {
  fullName?: string;
  username?: string;
  password?: string;
}