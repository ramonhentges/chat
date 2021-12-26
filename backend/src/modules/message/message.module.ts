import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeormMessageRepository } from 'src/external/repositories/typeorm/typeorm-message-repository';
import { MessagesGateway } from 'src/gateways/messages.gateway';
import { AuthModule } from '../auth/auth.module';
import { GroupModule } from '../group/group.module';
import { UserModule } from '../user/user.module';
import { GroupMessageController } from './group-message.controller';
import { MessageService } from './message.service';
import { UserMessageController } from './user-message.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([TypeormMessageRepository]),
    AuthModule,
    forwardRef(() => GroupModule),
    UserModule
  ],
  controllers: [UserMessageController, GroupMessageController],
  providers: [MessageService, MessagesGateway, Array],
  exports: [MessagesGateway]
})
export class MessageModule {}
