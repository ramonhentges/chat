import { Request, Controller, Get, Param, Query } from '@nestjs/common';
import { QueryFilter } from 'src/global-dto/query';
import { MessageService } from './message.service';

@Controller('user-message')
export class UserMessageController {
  constructor(private messageService: MessageService) {}

  @Get(':username')
  async index(
    @Param('username') username: string,
    @Request() req,
    @Query() query: QueryFilter
  ) {
    return this.messageService.getContactMessages(req.user, username, query);
  }

  @Get('last/messages')
  async lastMessages(@Request() req) {
    return this.messageService.userLastMessages(req.user);
  }
}
