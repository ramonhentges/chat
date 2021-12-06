import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/models/user.model';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  async validateUser(username: string, password: string): Promise<User> {
    return this.userService.login(username, password);
  }

  async login(user: User) {
    const payload = { username: user.username, id: user.id };
    return {
      accessToken: this.jwtService.sign(payload)
    };
  }

  async validate(token: string) {
    const payload = this.jwtService
      .verifyAsync(token)
      .then((payload) => {
        return payload;
      })
      .catch(() => {
        return false;
      });
    return payload;
  }
}
