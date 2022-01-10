import { QueryFilter } from '@/global-dto/query';
import { Group } from '@/models/group.model';
import { Message } from '@/models/message.model';
import { User } from '@/models/user.model';
import { MessageRepository } from '@/ports/message-repository';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Message)
export class TypeormMessageRepository
  extends Repository<Message>
  implements MessageRepository
{
  async findUserActiveContacts(user: User): Promise<User[]> {
    const userMessages = await this.createQueryBuilder('msg')
      .where([
        { origin: user, groupDestination: null },
        { userDestination: user, groupDestination: null }
      ])
      .leftJoin('msg.origin', 'org')
      .leftJoin('msg.userDestination', 'userDst')
      .distinctOn(['org.id', 'userDst.id'])
      .select([
        'msg.id',
        'org.id',
        'org.username',
        'userDst.id',
        'userDst.username'
      ])
      .getMany();
    const users: User[] = [];
    userMessages.forEach((value) => {
      let userToAdd: User;
      if (value.origin.username === user.username) {
        userToAdd = value.userDestination;
      } else {
        userToAdd = value.origin;
      }
      if (!isUserInArray(users, userToAdd)) {
        users.push(userToAdd);
      }
    });
    return users;
  }
  findContactLastMessage(user: User, contact: User): Promise<Message> {
    return this.findOne({
      where: [
        {
          origin: user,
          userDestination: contact
        },
        {
          origin: contact,
          userDestination: user
        }
      ],
      relations: ['origin', 'userDestination', 'readedBy', 'readedBy.user'],
      order: { createdAt: 'DESC' }
    });
  }
  findGroupMessages(group: Group, query: QueryFilter): Promise<Message[]> {
    return this.find({
      where: { groupDestination: group },
      relations: ['origin', 'groupDestination', 'readedBy', 'readedBy.user'],
      order: { createdAt: 'DESC' },
      take: query.take,
      skip: query.skip
    });
  }
  findLastGroupMessage(group: Group): Promise<Message> {
    return this.findOne({
      where: { groupDestination: group },
      relations: ['origin', 'groupDestination', 'readedBy', 'readedBy.user'],
      order: { createdAt: 'DESC' }
    });
  }
  async findContactMessages(
    user: User,
    contact: User,
    query: QueryFilter
  ): Promise<Message[]> {
    return this.find({
      where: [
        {
          origin: user,
          userDestination: contact
        },
        {
          origin: contact,
          userDestination: user
        }
      ],
      relations: ['origin', 'userDestination', 'readedBy', 'readedBy.user'],
      order: { createdAt: 'DESC' },
      take: query.take,
      skip: query.skip
    });
  }
  addGroupMessage(
    group: Group,
    message: string,
    origin: User
  ): Promise<Message> {
    const messageToStore = this.create({
      origin,
      message,
      groupDestination: group
    });
    return this.save(messageToStore);
  }
  addContactMessage(
    contact: User,
    message: string,
    origin: User
  ): Promise<Message> {
    const messageToSave = this.create({
      origin,
      message,
      userDestination: contact
    });
    return this.save(messageToSave);
  }
  async deleteMessage(messageId: string): Promise<void> {
    await this.update({ id: messageId }, { deleted: true, message: '' });
  }
  findOneByID(messageId: string): Promise<Message> {
    return this.findOne({
      where: { id: messageId },
      relations: [
        'origin',
        'userDestination',
        'groupDestination',
        'readedBy',
        'readedBy.user'
      ]
    });
  }
}

function isUserInArray(array: User[], user: User): boolean {
  return array.some((u) => user.id === u.id);
}
