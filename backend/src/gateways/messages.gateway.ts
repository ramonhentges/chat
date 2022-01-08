import { Group } from '@/models/group.model';
import { Message } from '@/models/message.model';
import { AuthService } from '@/modules/auth/auth.service';
import { MessageDto } from '@/modules/message/dto/message.dto';
import { MessageService } from '@/modules/message/message.service';
import { UserService } from '@/modules/user/user.service';
import { getValidationPipe } from '@/validation/validation-pipe';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
  WsResponse
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' }
})
export class MessagesGateway {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private messageService: MessageService
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(@ConnectedSocket() client: Socket) {
    const payload = await this.authService.validate(
      `${client.handshake.headers.authorization}`.replace('Bearer ', '')
    );
    if (payload) {
      const user = await this.userService.getByID(payload.id);
      if (user) {
        this.messageService.joinGroupsRooms(payload.id, client);
        client.join(`user-${payload.id}`);
        return;
      }
    }
    client.disconnect();
  }

  async addUserToGroupRoom(userId: string, group: Group) {
    const clients = await this.server.in(`user-${userId}`).fetchSockets();
    clients.forEach((client) => {
      client.emit('joinedGroup', group);
      client.join(`group-${group.id}`);
    });
  }

  async removeUserFromGroupRoom(userId: string, group: Group) {
    const clients = await this.server.in(`user-${userId}`).fetchSockets();
    clients.forEach((client) => {
      client.emit('leavedGroup', group);
      client.leave(`group-${group.id}`);
    });
  }

  @SubscribeMessage('msgToGroup')
  async handleGroupMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody(getValidationPipe('websocket'))
    message: MessageDto
  ): Promise<WsResponse<Message>> {
    const userToken = await this.authService.validate(
      `${client.handshake.headers.authorization}`.replace('Bearer ', '')
    );
    const sendedMessage = await this.messageService
      .postGroupMessage(userToken, message)
      .catch((err) => {
        if (err.status === 403) {
          throw new WsException(err.response.message);
        }
        throw new WsException('Erro interno do sistema');
      });
    client.broadcast
      .to(`group-${message.destination}`)
      .emit('msgFromGroup', sendedMessage);
    return { event: 'msgFromGroup', data: sendedMessage };
  }

  @SubscribeMessage('msgToUser')
  async handleUserMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody(getValidationPipe('websocket'))
    message: MessageDto
  ): Promise<WsResponse<Message>> {
    const userToken = await this.authService.validate(
      `${client.handshake.headers.authorization}`.replace('Bearer ', '')
    );
    const sendedMessage = await this.messageService
      .postUserMessage(userToken, message)
      .catch((err) => {
        if (err.status === 404) {
          throw new WsException(err.response.message);
        }
        throw new WsException('Erro interno do sistema');
      });
    client.broadcast
      .to(`user-${sendedMessage.userDestination.id}`)
      .emit('msgFromUser', sendedMessage);
    return { event: 'sendedMsgFromUser', data: sendedMessage };
  }

  @SubscribeMessage('deleteGroupMessage')
  async handleDeleteGroupMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    messageId: string
  ): Promise<WsResponse<any>> {
    const userToken = await this.authService.validate(
      `${client.handshake.headers.authorization}`.replace('Bearer ', '')
    );
    const returnMessage = await this.messageService
      .deleteMessage(userToken, messageId)
      .catch((err) => {
        if (err.status === 403) {
          throw new WsException(err.response.message);
        }
        throw new WsException('Erro interno do sistema');
      });
    client.broadcast
      .to(`group-${returnMessage.groupDestination.id}`)
      .emit('deletedGroupMessage', returnMessage);
    return { event: 'deletedGroupMessage', data: returnMessage };
  }

  @SubscribeMessage('deleteUserMessage')
  async handleDeleteUserMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    messageId: string
  ): Promise<WsResponse<any>> {
    const userToken = await this.authService.validate(
      `${client.handshake.headers.authorization}`.replace('Bearer ', '')
    );
    const deletedMessage = await this.messageService
      .deleteMessage(userToken, messageId)
      .catch((err) => {
        if (err.status === 403) {
          throw new WsException(err.response.message);
        }
        throw new WsException('Erro interno do sistema');
      });

    const returnMessage = deletedMessage;
    client.broadcast
      .to(`user-${deletedMessage.userDestination.id}`)
      .emit('deletedUserMessage', returnMessage);
    return {
      event: 'deletedUserMessage',
      data: returnMessage
    };
  }
}
