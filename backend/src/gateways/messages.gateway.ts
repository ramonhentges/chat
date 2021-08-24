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
      const user = await this.userService.getByUUID(payload.uuid);
      if (user) {
        this.messageService.joinGroupsRooms(payload.uuid, client);
        client.join(`user-${payload.uuid}`);
        return;
      }
    }
    client.disconnect();
  }

  addUserToGroupRoom(userUuid: string, groupUuid: string) {
    this.server.in(`user-${userUuid}`).clients((err, clients) => {
      clients.forEach((clientId) => {
        const clientSocket = this.server.sockets.connected[clientId];
        clientSocket.emit('joined-group', { uuid: `${groupUuid}` });
        clientSocket.join(`group-${groupUuid}`);
      });
    });
  }

  removeUserFromGroupRoom(userUuid: string, groupUuid: string) {
    this.server.in(`user-${userUuid}`).clients((err, clients) => {
      clients.forEach((clientId) => {
        const clientSocket = this.server.sockets.connected[clientId];
        clientSocket.emit('leaved-group', { uuid: `${groupUuid}` });
        clientSocket.leave(`group-${groupUuid}`);
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
      .to(`user-${sendedMessage.destinationUuid}`)
      .emit('msgFromUser', sendedMessage.message);
    return { event: 'sendedMsgFromUser', data: sendedMessage.message };
  }

  @SubscribeMessage('deleteGroupMessage')
  async handleDeleteGroupMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    messageUuid: string
  ): Promise<WsResponse<any>> {
    const userToken = await this.authService.validate(
      `${client.handshake.headers.authorization}`.replace('Bearer ', '')
    );
    const destination = await this.messageService
      .deleteGroupMessage(userToken, messageUuid)
      .catch((err) => {
        if (err.status === 403) {
          throw new WsException(err.response.message);
        }
        throw new WsException('Erro interno do sistema');
      });
    const returnMessage = {
      uuid: messageUuid,
      origin: { username: userToken.username },
      groupDestination: { uuid: destination.uuid }
    };
    client.broadcast
      .to(`group-${destination.uuid}`)
      .emit('deleteMsgFromGroup', returnMessage);
    return { event: 'deleteMsgFromGroup', data: returnMessage };
  }

  @SubscribeMessage('deleteUserMessage')
  async handleDeleteUserMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    messageUuid: string
  ): Promise<WsResponse<any>> {
    const userToken = await this.authService.validate(
      `${client.handshake.headers.authorization}`.replace('Bearer ', '')
    );
    const destination = await this.messageService
      .deleteUserMessage(userToken, messageUuid)
      .catch((err) => {
        if (err.status === 403) {
          throw new WsException(err.response.message);
        }
        throw new WsException('Erro interno do sistema');
      });

    const returnMessage = {
      uuid: messageUuid,
      origin: { username: userToken.username },
      userDestination: { username: destination.username }
    };
    client.broadcast
      .to(`user-${destination.uuid}`)
      .emit('deleteMsgFromUser', returnMessage);
    return {
      event: 'deleteMsgFromUser',
      data: returnMessage
    };
  }
}
