import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesGateway } from 'src/gateways/messages.gateway';
import { Group } from 'src/models/group.model';
import { Message } from 'src/models/message.model';
import { User } from 'src/models/user.model';
import { AuthModule } from '../auth/auth.module';
import { GroupModule } from '../group/group.module';
import { UserModule } from '../user/user.module';
import { GroupMessageController } from './group-message.controller';
import { MessageService } from './message.service';
import { UserMessageController } from './user-message.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Group, User, Message]),
    AuthModule,
    forwardRef(() => GroupModule),
    UserModule
  ],
  controllers: [UserMessageController, GroupMessageController],
  providers: [MessageService, MessagesGateway, Array],
  exports: [MessagesGateway]
})
export class MessageModule {}
