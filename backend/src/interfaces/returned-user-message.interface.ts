import { Message } from '@/models/message.model';

export interface ReturnedUserMessage {
  message: Message;
  destinationId: string;
}
