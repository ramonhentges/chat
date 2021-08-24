import { forwardRef } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from 'src/models/group.model';
import { User } from 'src/models/user.model';
import { MessageModule } from '../message/message.module';
import { UserService } from '../user/user.service';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Group, User]),
    forwardRef(() => MessageModule)
  ],
  controllers: [GroupController],
  providers: [GroupService, UserService],
  exports: [GroupService]
})
export class GroupModule {}
