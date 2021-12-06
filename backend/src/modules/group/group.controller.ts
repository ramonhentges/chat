import {
  Request,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UnprocessableEntityException,
  ValidationPipe
} from '@nestjs/common';
import { AddRemoveUserToGroupDto } from './dto/add-user-to-group.dto';
import { GroupDto } from './dto/group.dto';
import { GroupService } from './group.service';

@Controller('groups')
export class GroupController {
  constructor(private groupService: GroupService) {}

  @Get()
  index(@Request() req) {
    return this.groupService.myGroups(req.user);
  }

  @Get(':id')
  show(@Param('id') id: string, @Request() req) {
    return this.groupService.getByID(id, req.user);
  }

  @Post()
  async store(
    @Body(
      new ValidationPipe({
        validationError: {
          target: false,
          value: false
        },
        exceptionFactory: (errors) => new UnprocessableEntityException(errors)
      })
    )
    body: GroupDto,
    @Request() req
  ) {
    return this.groupService.create(req.user, body);
  }

  @Post('add-user')
  async addUser(
    @Body(
      new ValidationPipe({
        validationError: {
          target: false,
          value: false
        },
        exceptionFactory: (errors) => new UnprocessableEntityException(errors)
      })
    )
    body: AddRemoveUserToGroupDto,
    @Request() req
  ) {
    return this.groupService.addUser(body, req.user);
  }

  @Delete('remove-user/:groupId/:username')
  @HttpCode(204)
  async removeUser(
    @Request() req,
    @Param('groupId') groupId: string,
    @Param('username') username: string
  ) {
    await this.groupService.removeUser({ username, groupId }, req.user);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(
      new ValidationPipe({
        validationError: {
          target: false,
          value: false
        },
        exceptionFactory: (errors) => new UnprocessableEntityException(errors)
      })
    )
    body: GroupDto,
    @Request() req
  ) {
    return this.groupService.update(id, body, req.user);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string, @Request() req) {
    return this.groupService.delete(id, req.user);
  }
}
