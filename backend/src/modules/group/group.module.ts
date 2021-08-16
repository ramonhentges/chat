import { forwardRef } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupController } from 'src/controllers/group/group.controller';
import { Group } from 'src/models/group.model';
import { User } from 'src/models/user.model';
import { GroupService } from 'src/services/group/group.service';
import { UserService } from 'src/services/user/user.service';
import { MessageModule } from '../message/message.module';

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
