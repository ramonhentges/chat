import { Request, Controller, Get, Param } from '@nestjs/common';
import { MessageService } from './message.service';

@Controller('group-message')
export class GroupMessageController {
  constructor(private messageService: MessageService) {}

  @Get(':id')
  async index(@Param('id') id: string, @Request() req) {
    return this.messageService.listAllGroupMessages(id, req.user);
  }

  @Get('/last/:id')
  async last(@Param('id') id: string, @Request() req) {
    return this.messageService.lastGroupMessage(id, req.user);
  }
}
