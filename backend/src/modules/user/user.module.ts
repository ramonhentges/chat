import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { makeEncoder } from 'src/factories/encoder';
import { User } from 'src/models/user.model';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService, makeEncoder],
  controllers: [UserController],
  exports: [UserService]
})
export class UserModule {}
