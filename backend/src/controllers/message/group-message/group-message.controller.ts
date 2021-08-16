import { Request, Controller, Get, Param } from '@nestjs/common';
import { MessageService } from 'src/services/message/message.service';

@Controller('group-message')
export class GroupMessageController {
  constructor(private messageService: MessageService) {}

  @Get(':uuid')
  async index(@Param('uuid') uuid: string, @Request() req) {
    return this.messageService.listAllGroupMessages(uuid, req.user);
  }

  @Get('/last/:uuid')
  async last(@Param('uuid') uuid: string, @Request() req) {
    return this.messageService.lastGroupMessage(uuid, req.user);
  }
}
