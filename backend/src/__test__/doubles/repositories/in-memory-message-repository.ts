import { QueryFilter } from '@/global-dto/query';
import { Group } from '@/models/group.model';
import { Message } from '@/models/message.model';
import { User } from '@/models/user.model';
import { MessageRepository } from '@/ports/message-repository';

export class InMemoryMessageRepository implements MessageRepository {
  private readonly _data: Message[];
  private idcounter = 0;
  private get data() {
    return this._data;
  }

  constructor(data: Message[]) {
    this._data = data;
  }

  async findUserActiveContacts(user: User): Promise<User[]> {
    const contacts: User[] = [];
    this.data.forEach((message) => {
      let userToAdd: User;
      if (message.origin.username === user.username) {
        userToAdd = message.userDestination;
      } else if (message.userDestination?.username === user.username) {
        userToAdd = message.origin;
      }
      if (userToAdd) {
        if (!isUserInArray(contacts, userToAdd)) {
          contacts.push(userToAdd);
        }
      }
    });
    return contacts;
  }

  async findContactLastMessage(user: User, contact: User): Promise<Message> {
    let lastMessage: Message;
    for (let i = 0; i < this.data.length; i++) {
      const message = this.data[i];
      if (
        message.origin.username === user.username &&
        message.userDestination?.username === contact.username
      ) {
        lastMessage = message;
        i = this.data.length;
      } else if (
        message.origin.username === contact.username &&
        message.userDestination?.username === user.username
      ) {
        lastMessage = message;
        i = this.data.length;
      }
    }
    return lastMessage;
  }

  async findGroupMessages(
    group: Group,
    query: QueryFilter
  ): Promise<Message[]> {
    const messages: Message[] = this.data.filter(
      (message) => message.groupDestination?.id === group.id
    );
    return messages.slice(query.skip, query.take);
  }

  async findLastGroupMessage(group: Group): Promise<Message> {
    let returnMessage: Message;
    for (let i = 0; i < this.data.length; i++) {
      const message = this.data[i];
      if (message.groupDestination?.id === group.id) {
        returnMessage = message;
        i = this.data.length;
      }
    }
    return returnMessage;
  }

  async findContactMessages(
    user: User,
    contact: User,
    query: QueryFilter
  ): Promise<Message[]> {
    const messages = this.data.filter((message) => {
      if (
        message.origin.username === user.username &&
        message.userDestination?.username === contact.username
      ) {
        return true;
      } else if (
        message.origin.username === contact.username &&
        message.userDestination?.username === user.username
      ) {
        return true;
      }
      return false;
    });
    return messages.slice(query.skip, query.take);
  }

  async addGroupMessage(
    group: Group,
    message: string,
    origin: User
  ): Promise<Message> {
    const messageToAdd = new Message();
    messageToAdd.id = `${this.idcounter}`;
    messageToAdd.message = message;
    messageToAdd.origin = origin;
    messageToAdd.groupDestination = group;
    messageToAdd.createdAt = new Date();
    messageToAdd.readedBy = [];
    this.idcounter++;
    this._data.unshift(messageToAdd);
    return messageToAdd;
  }

  async addContactMessage(
    contact: User,
    message: string,
    origin: User
  ): Promise<Message> {
    const messageToAdd = new Message();
    messageToAdd.id = `${this.idcounter}`;
    messageToAdd.message = message;
    messageToAdd.origin = origin;
    messageToAdd.userDestination = contact;
    messageToAdd.createdAt = new Date();
    messageToAdd.readedBy = [];
    this.idcounter++;
    this._data.unshift(messageToAdd);
    return messageToAdd;
  }

  async deleteMessage(messageId: string): Promise<void> {
    const originalMessage = this.data.find(
      (message) => message.id === messageId
    );
    originalMessage.deleted = true;
    originalMessage.message = '';
  }

  async findOneByID(messageId: string): Promise<Message> {
    return this.data.find((message) => message.id === messageId);
  }
}

function isUserInArray(array: User[], user: User): boolean {
  return array.some((u) => user.id === u.id);
}
