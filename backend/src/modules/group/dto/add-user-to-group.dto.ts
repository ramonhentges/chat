import { IsNotEmpty, Length } from 'class-validator';

export class AddRemoveUserToGroupDto {
  @Length(5, 20, {
    message:
      'O nome de usuário deve conter entre $constraint1 e $constraint2 caracteres'
  })
  readonly username: string;

  @IsNotEmpty({ message: 'Deve ser informado o ID do grupo' })
  readonly groupId: string;
}
