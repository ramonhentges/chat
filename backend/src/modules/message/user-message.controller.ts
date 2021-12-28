import { Request, Controller, Get, Param, Query } from '@nestjs/common';
import { UserDecorator } from '@/decorators/user.decorator';
import { QueryFilter } from '@/global-dto/query';
import { MessageService } from './message.service';

@Controller('user-message')
export class UserMessageController {
  constructor(private messageService: MessageService) {}

  @Get(':username')
  async index(
    @Param('username') username: string,
    @UserDecorator() user,
    @Query() query: QueryFilter
  ) {
    return this.messageService.getContactMessages(user, username, query);
  }

  @Get('last/messages')
  async lastMessages(@UserDecorator() user) {
    return this.messageService.userLastMessages(user);
  }
}
