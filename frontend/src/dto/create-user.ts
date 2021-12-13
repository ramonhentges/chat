import { Length } from "class-validator";

export class CreateUserDto {
  constructor() {
    this.fullName = '';
    this.username = '';
    this.password = '';
    this.confirmPassword = ''
  }

  @Length(3, 100, {
    message: 'O nome deve conter entre $constraint1 e $constraint2 caracteres'
  })
  fullName: string;

  @Length(5, 20, {
    message:
      'O nome de usuário deve conter entre $constraint1 e $constraint2 caracteres'
  })
  username: string;

  @Length(8, 20, {
    message: 'A senha deve conter entre $constraint1 e $constraint2 caracteres'
  })
  password: string;

  @Length(8, 20, {
    message: 'A confirmação da senha deve conter entre $constraint1 e $constraint2 caracteres'
  })
  confirmPassword: string;
}
