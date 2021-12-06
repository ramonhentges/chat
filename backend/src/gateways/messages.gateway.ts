import { ValidationPipe } from '@nestjs/common';
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
import { wsOptions } from 'src/constants/constants';
import { Message } from 'src/models/message.model';
import { AuthService } from 'src/modules/auth/auth.service';
import { MessageDto } from 'src/modules/message/dto/message.dto';
import { MessageService } from 'src/modules/message/message.service';
import { UserService } from 'src/modules/user/user.service';

@WebSocketGateway(wsOptions)
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

  addUserToGroupRoom(userId: string, groupId: string) {
    this.server.in(`user-${userId}`).clients((err, clients) => {
      clients.forEach((clientId) => {
        const clientSocket = this.server.sockets.connected[clientId];
        clientSocket.emit('joined-group', { id: `${groupId}` });
        clientSocket.join(`group-${groupId}`);
      });
    });
  }

  removeUserFromGroupRoom(userId: string, groupId: string) {
    this.server.in(`user-${userId}`).clients((err, clients) => {
      clients.forEach((clientId) => {
        const clientSocket = this.server.sockets.connected[clientId];
        clientSocket.emit('leaved-group', { id: `${groupId}` });
        clientSocket.leave(`group-${groupId}`);
      });
    });
  }

  @SubscribeMessage('msgToGroup')
  async handleGroupMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody(
      new ValidationPipe({
        validationError: {
          target: false,
          value: false
        },
        exceptionFactory: (errors) => new WsException(errors)
      })
    )
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
    @MessageBody(
      new ValidationPipe({
        validationError: {
          target: false,
          value: false
        },
        exceptionFactory: (errors) => new WsException(errors)
      })
    )
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
      .to(`user-${sendedMessage.destinationId}`)
      .emit('msgFromUser', sendedMessage.message);
    return { event: 'sendedMsgFromUser', data: sendedMessage.message };
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
    const destination = await this.messageService
      .deleteGroupMessage(userToken, messageId)
      .catch((err) => {
        if (err.status === 403) {
          throw new WsException(err.response.message);
        }
        throw new WsException('Erro interno do sistema');
      });
    const returnMessage = {
      id: messageId,
      origin: { username: userToken.username },
      groupDestination: { id: destination.id }
    };
    client.broadcast
      .to(`group-${destination.id}`)
      .emit('deleteMsgFromGroup', returnMessage);
    return { event: 'deleteMsgFromGroup', data: returnMessage };
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
      .deleteUserMessage(userToken, messageId)
      .catch((err) => {
        if (err.status === 403) {
          throw new WsException(err.response.message);
        }
        throw new WsException('Erro interno do sistema');
      });

    const returnMessage = deletedMessage;
    client.broadcast
      .to(`user-${deletedMessage.userDestination.id}`)
      .emit('deleteMsgFromUser', returnMessage);
    return {
      event: 'deleteMsgFromUser',
      data: returnMessage
    };
  }
}
