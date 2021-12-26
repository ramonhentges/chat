import { QueryFilter } from 'src/global-dto/query';
import { Group } from 'src/models/group.model';
import { Message } from 'src/models/message.model';
import { User } from 'src/models/user.model';
import { MessageRepository } from 'src/ports/message-repository';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Message)
export class TypeormMessageRepository
  extends Repository<Message>
  implements MessageRepository {
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
    return this.createQueryBuilder('msg')
      .where([
        {
          origin: user,
          userDestination: contact
        },
        {
          origin: contact,
          userDestination: user
        }
      ])
      .leftJoin('msg.origin', 'org')
      .leftJoin('msg.userDestination', 'dst')
      .select([
        'msg.id',
        'msg.message',
        'msg.deleted',
        'msg.createdAt',
        'org.username',
        'org.fullName',
        'dst.username',
        'dst.fullName'
      ])
      .orderBy({ 'msg.createdAt': 'DESC' })
      .getOne();
  }
  findGroupMessages(group: Group, query: QueryFilter): Promise<Message[]> {
    return this.createQueryBuilder('msg')
      .where({ groupDestination: group })
      .leftJoin('msg.origin', 'org')
      .select([
        'msg.id',
        'msg.message',
        'msg.deleted',
        'msg.createdAt',
        'org.username',
        'org.fullName',
    ])
      .orderBy({ 'msg.createdAt': 'DESC' })
      .take(query.take)
      .skip(query.skip)
      .getMany();
  }
  findLastGroupMessage(group: Group): Promise<Message> {
    return this.createQueryBuilder('msg')
      .where({ groupDestination: group })
      .leftJoin('msg.origin', 'org')
      .select([
        'msg.id',
        'msg.message',
        'msg.deleted',
        'msg.createdAt',
        'org.username',
        'org.fullName',
    ])
      .orderBy({ 'msg.createdAt': 'DESC' })
      .getOne();
  }
  async findContactMessages(
    user: User,
    contact: User,
    query: QueryFilter
  ): Promise<Message[]> {
    return this.createQueryBuilder('msg')
      .where([
        { origin: user, userDestination: contact },
        { origin: contact, userDestination: user }
      ])
      .leftJoin('msg.origin', 'org')
      .select([
        'msg.id',
        'msg.message',
        'msg.deleted',
        'msg.createdAt',
        'org.username',
    ])
      .orderBy({ 'msg.createdAt': 'DESC' })
      .take(query.take)
      .skip(query.skip)
      .getMany();
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
      relations: ['origin', 'userDestination', 'groupDestination']
    });
  }
}

function isUserInArray(array: User[], user: User): boolean {
  return array.some((u) => user.id === u.id);
}
