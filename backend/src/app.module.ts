import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './models/user.model';
import { Group } from './models/group.model';
import { Message } from './models/message.model';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { UserModule } from './modules/user/user.module';
import { GroupModule } from './modules/group/group.module';
import { MessageModule } from './modules/message/message.module';
import { ReadedBy } from './models';

@Module({
  imports: [
    ConfigModule.forRoot({ cache: true, isGlobal: true }),
    TypeOrmModule.forRoot({
      type: process.env.TYPEORM_CONNECTION as any,
      host: process.env.TYPEORM_HOST,
      port: parseInt(process.env.TYPEORM_PORT),
      username: process.env.TYPEORM_USERNAME,
      password: process.env.TYPEORM_PASSWORD,
      database: process.env.TYPEORM_DATABASE,
      entities: [User, Group, Message, ReadedBy]
    }),
    AuthModule,
    UserModule,
    MessageModule,
    GroupModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    }
  ]
})
export class AppModule {}
