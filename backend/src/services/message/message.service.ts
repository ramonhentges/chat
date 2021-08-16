import {
  ForbiddenException,
  Injectable,
  Inject,
  forwardRef
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { JwsTokenDto } from 'src/dto/jws-token.dto';
import { MessageDto } from 'src/dto/message.dto';
import { ReturnedUserMessage } from 'src/interfaces/returned-user-message.interface';
import { Message } from 'src/models/message.model';
import { User } from 'src/models/user.model';
import { Repository } from 'typeorm';
import { GroupService } from '../group/group.service';
import { UserService } from '../user/user.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
    @Inject(forwardRef(() => GroupService))
    private groupService: GroupService,
    private userService: UserService
  ) {}

  async userLastMessages(user: JwsTokenDto) {
    const userBd = await this.userService.getByUUID(user.uuid);

    const userMessages = await this.messageRepo
      .createQueryBuilder('msg')
      .where([
        { origin: userBd, groupDestination: null },
        { userDestination: userBd, groupDestination: null }
      ])
      .leftJoin('msg.origin', 'org')
      .leftJoin('msg.userDestination', 'userDst')
      .distinctOn(['org.username', 'userDst.username'])
      .select([
        'msg.id',
        'org.id',
        'org.username',
        'userDst.id',
        'userDst.username'
      ])
      .getMany();

    const messages = [];
    const usedContacts = new Map();

    const getUserMessages = userMessages.map(async (message) => {
      message.origin.username === userBd.username
        ? await this.getLastContactMessage(
            messages,
            usedContacts,
            userBd,
            message.userDestination
          )
        : await this.getLastContactMessage(
            messages,
            usedContacts,
            userBd,
            message.origin
          );
    });
    await Promise.all(getUserMessages);

    return messages;
  }

  async getLastContactMessage(
    messageList: Message[],
    contactsAlreadyOnList: Map<any, any>,
    user: User,
    contact: User
  ) {
    if (!contactsAlreadyOnList.has(contact.username)) {
      contactsAlreadyOnList.set(contact.username, true);
      const lastMessage = await this.messageRepo
        .createQueryBuilder('msg')
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
          'msg.uuid',
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
      messageList.push(lastMessage);
    }
  }

  async listAllGroupMessages(uuidGroup: string, user: JwsTokenDto) {
    const destination = await this.groupService.getByUUID(uuidGroup, user);

    return this.messageRepo
      .createQueryBuilder('msg')
      .where({ groupDestination: destination })
      .leftJoin('msg.origin', 'org')
      .select([
        'msg.uuid',
        'msg.message',
        'msg.deleted',
        'msg.createdAt',
        'org.username',
        'org.fullName'
      ])
      .orderBy({ 'msg.createdAt': 'ASC' })
      .getMany();
  }

  async lastGroupMessage(uuidGroup: string, user: JwsTokenDto) {
    const destination = await this.groupService.getByUUID(uuidGroup, user);

    return this.messageRepo
      .createQueryBuilder('msg')
      .where({ groupDestination: destination })
      .leftJoin('msg.origin', 'org')
      .select([
        'msg.uuid',
        'msg.message',
        'msg.deleted',
        'msg.createdAt',
        'org.username',
        'org.fullName'
      ])
      .orderBy({ 'msg.createdAt': 'DESC' })
      .getOne();
  }

  async listAllContactMessages(
    loggedUser: JwsTokenDto,
    contactUsername: string
  ) {
    const logged = await this.userService.getByUUID(loggedUser.uuid);
    const contact = await this.userService.getByUsername(contactUsername);
    return this.messageRepo
      .createQueryBuilder('msg')
      .where([
        { origin: logged, userDestination: contact },
        { origin: contact, userDestination: logged }
      ])
      .leftJoin('msg.origin', 'org')
      .select([
        'msg.uuid',
        'msg.message',
        'msg.deleted',
        'msg.createdAt',
        'org.username'
      ])
      .orderBy({ 'msg.createdAt': 'ASC' })
      .getMany();
  }

  async postGroupMessage(user: JwsTokenDto, message: MessageDto) {
    const originUser = await this.userService.getByUUID(user.uuid);

    const destinationGroup = await this.groupService.getByUUID(
      message.destination,
      user
    );

    const messageToStore = this.messageRepo.create({
      origin: originUser,
      message: message.message,
      groupDestination: destinationGroup
    });
    const savedMessage = await this.messageRepo.save(messageToStore);
    const returnMessage = await this.messageRepo.findOne(savedMessage.id, {
      select: ['uuid', 'message', 'createdAt', 'deleted']
    });

    return {
      origin: {
        username: originUser.username,
        fullName: originUser.fullName
      },
      ...returnMessage
    };
  }

  async postUserMessage(
    loggedUser: JwsTokenDto,
    message: MessageDto
  ): Promise<ReturnedUserMessage> {
    const originUser = await this.userService.getByUUID(loggedUser.uuid);
    const destination = await this.userService.getByUsername(
      message.destination
    );
    const messageToSave = this.messageRepo.create({
      origin: originUser,
      message: message.message,
      userDestination: destination
    });

    const savedMessage = await this.messageRepo.save(messageToSave);
    const returnMessage = await this.messageRepo.findOne(savedMessage.id, {
      select: ['uuid', 'message', 'createdAt', 'deleted']
    });

    return {
      message: {
        origin: {
          username: originUser.username,
          fullName: originUser.fullName
        },
        userDestination: {
          username: destination.username,
          fullName: destination.fullName
        },
        ...returnMessage
      },
      destinationUuid: destination.uuid
    };
  }

  async deleteGroupMessage(user: JwsTokenDto, messageUuid: string) {
    const origin = await this.userService.getByUUID(user.uuid);
    const message = await this.messageRepo.findOne({
      where: { uuid: messageUuid, origin },
      relations: ['groupDestination']
    });

    if (message) {
      this.messageRepo.update(
        { uuid: messageUuid },
        { ...message, deleted: true, message: '' }
      );
      return message.groupDestination;
    }
    throw new ForbiddenException({
      message: 'Você não tem permissão para excluir esta mensagem'
    });
  }

  async deleteUserMessage(user: JwsTokenDto, messageUuid: string) {
    const origin = await this.userService.getByUUID(user.uuid);
    const message = await this.messageRepo.findOne({
      where: { uuid: messageUuid, origin },
      relations: ['userDestination']
    });

    if (message) {
      this.messageRepo.update(
        { uuid: messageUuid },
        { ...message, deleted: true, message: '' }
      );
      return message.userDestination;
    }
    throw new ForbiddenException({
      message: 'Você não tem permissão para excluir esta mensagem'
    });
  }

  async joinGroupsRooms(userUuid: string, socket: Socket): Promise<void> {
    const userGroups = await this.userService.getUserGroups(userUuid);
    userGroups.forEach((group) => {
      socket.join(`group-${group.uuid}`);
    });
  }
}
