import { Length, MaxLength } from "class-validator";

export class CreateGroupDto {
  @Length(3, 20, {
    message: 'O nome deve conter entre $constraint1 e $constraint2 caracteres'
  })
  name: string;

  @MaxLength(30, {
    message: 'A descrição pode conter no máximo $constraint1 caracteres'
  })
  description: string;
}
