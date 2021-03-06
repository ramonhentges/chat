import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeormUserRepository } from '@/external/repositories/typeorm/typeorm-user-repository';
import { makeEncoder } from '@/factories/encoder';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([TypeormUserRepository])],
  providers: [UserService, makeEncoder],
  controllers: [UserController],
  exports: [UserService]
})
export class UserModule {}
