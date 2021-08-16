import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupMessageController } from 'src/controllers/message/group-message/group-message.controller';
import { UserMessageController } from 'src/controllers/message/user-message/user-message.controller';
import { MessagesGateway } from 'src/gateways/messages.gateway';
import { Group } from 'src/models/group.model';
import { Message } from 'src/models/message.model';
import { User } from 'src/models/user.model';
import { MessageService } from 'src/services/message/message.service';
import { UserService } from 'src/services/user/user.service';
import { AuthModule } from '../auth/auth.module';
import { GroupModule } from '../group/group.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Group, User, Message]),
    AuthModule,
    forwardRef(() => GroupModule)
  ],
  controllers: [UserMessageController, GroupMessageController],
  providers: [MessageService, MessagesGateway, UserService, Array],
  exports: [MessagesGateway]
})
export class MessageModule {}
