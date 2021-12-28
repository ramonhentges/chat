import { Controller, Post, UseGuards, HttpCode } from '@nestjs/common';
import { Public } from '@/constants/constants';
import { UserDecorator } from '@/decorators/user.decorator';
import { LocalAuthGuard } from '@/modules/auth/guards/local-auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  async login(@UserDecorator() user) {
    return this.authService.login(user);
  }
}
