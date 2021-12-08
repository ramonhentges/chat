import {
  Body,
  Controller,
  Request,
  Get,
  Param,
  Post,
  Put
} from '@nestjs/common';
import { Public } from 'src/constants/constants';
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
  myUser(@Request() req) {
    const { user } = req;
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
  async update(@Request() req, @Body() body: UserDto) {
    const { user } = req;
    return this.userService.update(user, body);
  }
}
