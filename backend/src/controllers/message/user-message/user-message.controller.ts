import { Request, Controller, Get, Param } from '@nestjs/common';
import { MessageService } from 'src/services/message/message.service';

@Controller('user-message')
export class UserMessageController {
  constructor(private messageService: MessageService) {}

  @Get(':username')
  async index(@Param('username') username: string, @Request() req) {
    return this.messageService.listAllContactMessages(req.user, username);
  }

  @Get('last/messages')
  async lastMessages(@Request() req) {
    return this.messageService.userLastMessages(req.user);
  }
}
