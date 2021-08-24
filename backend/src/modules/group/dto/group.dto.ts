import { Length, MaxLength } from 'class-validator';

export class GroupDto {
  @Length(3, 20, {
    message: 'O nome deve conter entre $constraint1 e $constraint2 caracteres'
  })
  readonly name: string;

  @MaxLength(30, {
    message: 'A descrição pode conter no máximo $constraint1 caracteres'
  })
  readonly description: string;
}
