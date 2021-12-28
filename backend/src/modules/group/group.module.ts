import { forwardRef } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeormGroupRepository } from '@/external/repositories/typeorm/typeorm-group-repository';
import { MessageModule } from '../message/message.module';
import { UserModule } from '../user/user.module';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TypeormGroupRepository]),
    forwardRef(() => MessageModule),
    UserModule
  ],
  controllers: [GroupController],
  providers: [GroupService],
  exports: [GroupService]
})
export class GroupModule {}
