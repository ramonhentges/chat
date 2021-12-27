import {
  Request,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put
} from '@nestjs/common';
import { UserDecorator } from 'src/decorators/user.decorator';
import { AddRemoveUserToGroupDto } from './dto/add-user-to-group.dto';
import { GroupDto } from './dto/group.dto';
import { GroupService } from './group.service';

@Controller('groups')
export class GroupController {
  constructor(private groupService: GroupService) {}

  @Get()
  index(@UserDecorator() user) {
    return this.groupService.myGroups(user);
  }

  @Get(':id')
  show(@Param('id') id: string, @UserDecorator() user) {
    return this.groupService.getByID(id, user);
  }

  @Post()
  async store(@Body() body: GroupDto, @UserDecorator() user) {
    return this.groupService.create(user, body);
  }

  @Post('add-user')
  async addUser(@Body() body: AddRemoveUserToGroupDto, @UserDecorator() user) {
    return this.groupService.addUser(body, user);
  }

  @Delete('remove-user/:groupId/:username')
  @HttpCode(204)
  async removeUser(
    @UserDecorator() user,
    @Param('groupId') groupId: string,
    @Param('username') username: string
  ) {
    await this.groupService.removeUser({ username, groupId }, user);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: GroupDto,
    @UserDecorator() user
  ) {
    return this.groupService.update(id, body, user);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string, @UserDecorator() user) {
    return this.groupService.delete(id, user);
  }
}
