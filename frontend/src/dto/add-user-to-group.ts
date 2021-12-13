import { IsNotEmpty, Length } from 'class-validator';

export class AddRemoveUserToGroupDto {
  constructor() {
    this.username = '';
    this.groupId = '';
  }
  @Length(5, 20, {
    message:
      'O nome de usuário deve conter entre $constraint1 e $constraint2 caracteres'
  })
  username: string;

  @IsNotEmpty({ message: 'Deve ser informado o ID do grupo' })
  groupId: string;
}
