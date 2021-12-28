import { Request, Controller, Get, Param, Query } from '@nestjs/common';
import { UserDecorator } from '@/decorators/user.decorator';
import { QueryFilter } from '@/global-dto/query';
import { MessageService } from './message.service';

@Controller('group-message')
export class GroupMessageController {
  constructor(private messageService: MessageService) {}

  @Get(':id')
  async index(
    @Param('id') id: string,
    @UserDecorator() user,
    @Query() query: QueryFilter
  ) {
    return this.messageService.getGroupMessages(id, user, query);
  }

  @Get('/last/:id')
  async last(@Param('id') id: string, @UserDecorator() user) {
    return this.messageService.lastGroupMessage(id, user);
  }
}
