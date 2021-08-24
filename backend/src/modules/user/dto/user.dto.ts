import { Length } from 'class-validator';

export class UserDto {
  @Length(3, 100, {
    message: 'O nome deve conter entre $constraint1 e $constraint2 caracteres'
  })
  readonly fullName: string;

  @Length(5, 20, {
    message:
      'O nome de usuário deve conter entre $constraint1 e $constraint2 caracteres'
  })
  readonly username: string;

  @Length(8, 20, {
    message: 'A senha deve conter entre $constraint1 e $constraint2 caracteres'
  })
  readonly password: string;
}
