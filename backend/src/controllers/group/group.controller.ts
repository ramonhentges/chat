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
import { AddRemoveUserToGroupDto } from 'src/dto/add-user-to-group.dto';
import { GroupDto } from 'src/dto/group.dto';
import { GroupService } from 'src/services/group/group.service';

@Controller('groups')
export class GroupController {
  constructor(private groupService: GroupService) {}

  @Get()
  index(@Request() req) {
    return this.groupService.myGroups(req.user);
  }

  @Get(':uuid')
  show(@Param('uuid') uuid: string, @Request() req) {
    return this.groupService.getByUUID(uuid, req.user);
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

  @Delete('remove-user/:groupUuid/:username')
  @HttpCode(204)
  async removeUser(
    @Request() req,
    @Param('groupUuid') groupUuid: string,
    @Param('username') username: string
  ) {
    await this.groupService.removeUser({ username, groupUuid }, req.user);
  }

  @Put(':uuid')
  async update(
    @Param('uuid') uuid: string,
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
    return this.groupService.update(uuid, body, req.user);
  }

  @Delete(':uuid')
  @HttpCode(204)
  async delete(@Param('uuid') uuid: string, @Request() req) {
    return this.groupService.delete(uuid, req.user);
  }
}
