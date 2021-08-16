import { Request, Controller, Post, UseGuards, HttpCode } from '@nestjs/common';
import { AuthService } from 'src/services/auth/auth.service';
import { Public } from 'src/constants/constants';
import { LocalAuthGuard } from 'src/guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
}
