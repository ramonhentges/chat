import { QueryFilter } from '@/global-dto/query';
import { Group } from '@/models/group.model';
import { Message } from '@/models/message.model';
import { User } from '@/models/user.model';

export interface MessageRepository {
  findUserActiveContacts(user: User): Promise<User[]>;
  findContactLastMessage(user: User, contact: User): Promise<Message>;
  findGroupMessages(group: Group, query: QueryFilter): Promise<Message[]>;
  findLastGroupMessage(group: Group): Promise<Message>;
  findContactMessages(
    user: User,
    contact: User,
    query: QueryFilter
  ): Promise<Message[]>;
  addGroupMessage(
    group: Group,
    message: string,
    origin: User
  ): Promise<Message>;
  addContactMessage(
    contact: User,
    message: string,
    origin: User
  ): Promise<Message>;
  deleteMessage(messageId: string): Promise<void>;
  findOneByID(messageId: string): Promise<Message>;
}
