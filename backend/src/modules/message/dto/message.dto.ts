import { IsNotEmpty } from 'class-validator';

export class MessageDto {
  @IsNotEmpty({ message: 'A mensagem não pode estar vazia' })
  readonly message: string;

  @IsNotEmpty({ message: 'O destinatário deve ser informado' })
  readonly destination: string;
}
