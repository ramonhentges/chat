import { TypeormMessageRepository } from '@/external/repositories/typeorm/typeorm-message-repository';
import { QueryFilter } from '@/global-dto/query';
import { Message } from '@/models/message.model';
import { User } from '@/models/user.model';
import { MessageRepository } from '@/ports/message-repository';
import {
  ForbiddenException, forwardRef, Inject, Injectable
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { JwsTokenDto } from '../auth/dto/jws-token.dto';
import { GroupService } from '../group/group.service';
import { UserService } from '../user/user.service';
import { MessageDto } from './dto/message.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(TypeormMessageRepository)
    private messageRepo: MessageRepository,
    @Inject(forwardRef(() => GroupService))
    private groupService: GroupService,
    private userService: UserService
  ) { }

  async userLastMessages(user: JwsTokenDto) {
    const userBd = await this.userService.getByID(user.id);
    const contacts = await this.messageRepo.findUserActiveContacts(userBd);
    const getMessages = contacts.map(async (contact) => {
      return await this.messageRepo.findContactLastMessage(userBd, contact);
    });
    const messages = await Promise.all(getMessages).then((result) => {
      return result;
    });
    return messages;
  }

  async getGroupMessages(
    idGroup: string,
    user: JwsTokenDto,
    query: QueryFilter
  ) {
    const destination = await this.groupService.getByID(idGroup, user);
    const messages = await this.messageRepo.findGroupMessages(
      destination,
      query
    );
    return messages.reverse();
  }

  async lastGroupMessage(idGroup: string, user: JwsTokenDto) {
    const destination = await this.groupService.getByID(idGroup, user);
    return this.messageRepo.findLastGroupMessage(destination);
  }

  async getContactMessages(
    loggedUser: JwsTokenDto,
    contactUsername: string,
    query: QueryFilter
  ) {
    const logged = await this.userService.getByID(loggedUser.id);
    const contact = await this.userService.getByUsername(contactUsername);
    const messages = await this.messageRepo.findContactMessages(
      logged,
      contact,
      query
    );
    return messages.reverse();
  }

  async postGroupMessage(user: JwsTokenDto, message: MessageDto) {
    const originUser = await this.userService.getByID(user.id);

    const destinationGroup = await this.groupService.getByID(
      message.destination,
      user
    );
    const storedMessage = await this.messageRepo.addGroupMessage(
      destinationGroup,
      message.message,
      originUser
    );
    return this.messageRepo.findOneByID(storedMessage.id);
  }

  async postUserMessage(loggedUser: JwsTokenDto, message: MessageDto) {
    const originUser = await this.userService.getByID(loggedUser.id);
    const destination = await this.userService.getByUsername(
      message.destination
    );
    const storedMessage = await this.messageRepo.addContactMessage(
      destination,
      message.message,
      originUser
    );
    return this.messageRepo.findOneByID(storedMessage.id);
  }

  async deleteMessage(user: JwsTokenDto, messageId: string) {
    const origin = await this.userService.getByID(user.id);
    const message = await this.messageRepo.findOneByID(messageId);

    if (message && isMyMessage(origin, message) && message.canDelete()) {
      this.messageRepo.deleteMessage(messageId);
      return { id: messageId, ...message, deleted: true, message: '' };
    }
    throw new ForbiddenException({
      message: 'Você não pode excluir esta mensagem'
    });
  }

  async joinGroupsRooms(userId: string, socket: Socket): Promise<void> {
    const userGroups = await this.userService.getUserGroups(userId);
    userGroups.forEach((group) => {
      socket.join(`group-${group.id}`);
    });
  }
}

function isMyMessage(user: User, message: Message): boolean {
  return user.id === message.origin.id;
}