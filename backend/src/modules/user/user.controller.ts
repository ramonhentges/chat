import {
  Body,
  Controller,
  Request,
  Get,
  Param,
  Post,
  Put
} from '@nestjs/common';
import { Public } from '@/constants/constants';
import { UserDecorator } from '@/decorators/user.decorator';
import { UpdateUserDto } from './dto/edit-user.dto';
import { UserDto } from './dto/user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  index() {
    return this.userService.listAll();
  }

  @Get('/my/user')
  myUser(@UserDecorator() user) {
    return this.userService.getByIDWithoutID(user.id);
  }

  @Get(':username')
  show(@Param('username') username: string) {
    return this.userService.getByUsernameWithoutID(username);
  }

  @Public()
  @Post()
  async store(@Body() body: UserDto) {
    return this.userService.store(body);
  }

  @Put()
  async update(@UserDecorator() user, @Body() body: UpdateUserDto) {
    return this.userService.update(user, body);
  }
}
