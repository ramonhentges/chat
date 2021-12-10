import { Request, Controller, Get, Param, Query } from '@nestjs/common';
import { QueryFilter } from 'src/global-dto/query';
import { MessageService } from './message.service';

@Controller('group-message')
export class GroupMessageController {
  constructor(private messageService: MessageService) {}

  @Get(':id')
  async index(
    @Param('id') id: string,
    @Request() req,
    @Query() query: QueryFilter
  ) {
    return this.messageService.getGroupMessages(id, req.user, query);
  }

  @Get('/last/:id')
  async last(@Param('id') id: string, @Request() req) {
    return this.messageService.lastGroupMessage(id, req.user);
  }
}
