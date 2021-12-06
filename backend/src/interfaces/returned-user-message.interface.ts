import { Message } from 'src/models/message.model';

export interface ReturnedUserMessage {
  message: Message;
  destinationId: string;
}
